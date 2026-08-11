#!/usr/bin/env node
/**
 * Generates every image in scripts/manifest.mjs into public/images/.
 *
 *   npm run images                      generate whatever is missing
 *   npm run images -- --force           regenerate everything
 *   npm run images -- --only id,id      generate named slots only
 *   npm run images -- --dry-run         print the plan, call nothing
 *
 * Two artefacts per slot. The model's untouched PNG lands in
 * public/images/_raw/ (gitignored) and the shipped WebP in public/images/.
 * Keeping the raw means a change to keying or to WebP quality costs CPU
 * rather than another 70 API calls — if the raw is on disk and the WebP is
 * not, the slot re-encodes without going near the network.
 *
 * The run is resumable by design: a slot whose WebP already exists is
 * skipped, so a run that dies at image 58 costs 12 images to finish, not 70.
 * A slot that fails is retried twice and then recorded — one bad prompt never
 * takes the run down with it. Failed ids are printed at the end in a form you
 * can paste straight back into --only.
 */

import { existsSync } from 'node:fs'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

import { GoogleGenAI } from '@google/genai'
import sharp from 'sharp'

import { NEGATIVE, SLOTS, STYLE, TOTAL } from './manifest.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const IMAGES_DIR = join(ROOT, 'public', 'images')
const RAW_DIR = join(IMAGES_DIR, '_raw')

const MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image'
const CONCURRENCY = 3

// One attempt plus two retries, backing off between them. Image endpoints
// fail transiently often enough that a single attempt wastes a lot of runs.
const MAX_ATTEMPTS = 3
const BACKOFF_MS = [2_000, 6_000]

/**
 * Estimate only, and the one number here that goes stale. Override with
 * IMAGE_USD_EACH once you have a real per-image figure from billing.
 */
const USD_PER_IMAGE = Number(process.env.IMAGE_USD_EACH ?? 0.039)

// --- background keying -------------------------------------------------
// A pixel counts as background only if it is this light AND connected to the
// frame edge. Threshold alone would punch holes through the white cars in the
// manifest — polar white, glacier white, mineral white.
const WHITE_MIN = 236
// Light pixels touching the background get partial alpha so the cut-out keeps
// its anti-aliased edge instead of going hard and jagged.
const EDGE_SOFT_LO = 200
const TRIM_ALPHA = 8
const TRIM_MARGIN_RATIO = 0.02
const TRIM_MARGIN_MIN = 8

// --- WebP encoding -----------------------------------------------------
// Every image gets its own quality, found by encoding and measuring. A flat
// setting is wrong in both directions: it wastes bytes on a near-black
// showroom that would look identical 20 points lower, and it smears a
// detail shot that needed the headroom.
const WEBP_TARGET_BYTES = 250 * 1024
const WEBP_START_Q = 80
const WEBP_MIN_Q = 40
const WEBP_MAX_Q = 95
const WEBP_MAX_PROBES = 8
const WEBP_EFFORT = 5

function parseArgs(argv) {
  const options = { force: false, dryRun: false, only: null }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--force') options.force = true
    else if (arg === '--dry-run') options.dryRun = true
    else if (arg === '--only') options.only = splitIds(argv[++i])
    else if (arg.startsWith('--only=')) options.only = splitIds(arg.slice(7))
    else fail(`Unknown argument: ${arg}`)
  }
  return options
}

const splitIds = (value) =>
  String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

function fail(message) {
  console.error(`\n  ${message}\n`)
  process.exit(1)
}

function loadApiKey() {
  if (!process.env.GEMINI_API_KEY) {
    try {
      process.loadEnvFile(join(ROOT, '.env'))
    } catch {
      // Fall through to the check below, which gives the actionable message.
    }
  }
  const key = process.env.GEMINI_API_KEY?.trim()
  if (!key) {
    fail(
      'GEMINI_API_KEY is not set.\n' +
        '  Add it to .env at the repo root:\n' +
        '    GEMINI_API_KEY=your-key-here\n' +
        '  .env is gitignored. Never commit the key.',
    )
  }
  return key
}

const composePrompt = (slot) => `${slot.prompt}\n\n${STYLE}\n\n${NEGATIVE}`

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

async function generateImage(ai, slot) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: composePrompt(slot),
    config: {
      responseModalities: ['IMAGE'],
      // The manifest's ratios are passed through untouched and nothing is
      // cropped afterwards, so the model composes for the real frame.
      imageConfig: { aspectRatio: slot.ratio },
    },
  })

  const parts = response?.candidates?.[0]?.content?.parts ?? []
  const image = parts.find((part) => part.inlineData?.data)
  if (!image) {
    // Surface why, so a safety block or a quota trip is not reported as a
    // generic failure.
    const reason = response?.candidates?.[0]?.finishReason ?? 'no finishReason'
    const said = parts
      .map((part) => part.text)
      .filter(Boolean)
      .join(' ')
      .slice(0, 160)
    throw new Error(`no image in response (${reason})${said ? `: ${said}` : ''}`)
  }
  return Buffer.from(image.inlineData.data, 'base64')
}

/**
 * Keys the white seamless to alpha and trims to the subject.
 *
 * Background is found by flood filling inward from the frame edge rather than
 * by thresholding the whole image, which is what keeps a white car opaque: its
 * body is light but it is not connected to the border.
 */
async function keyWhiteToAlpha(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height } = info
  const lightness = (pixel) => {
    const i = pixel * 4
    return Math.min(data[i], data[i + 1], data[i + 2])
  }

  const outside = new Uint8Array(width * height)
  const stack = []
  const visit = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const pixel = y * width + x
    if (outside[pixel]) return
    if (lightness(pixel) < WHITE_MIN) return
    outside[pixel] = 1
    stack.push(pixel)
  }

  for (let x = 0; x < width; x++) {
    visit(x, 0)
    visit(x, height - 1)
  }
  for (let y = 0; y < height; y++) {
    visit(0, y)
    visit(width - 1, y)
  }
  while (stack.length) {
    const pixel = stack.pop()
    const x = pixel % width
    const y = (pixel - x) / width
    visit(x - 1, y)
    visit(x + 1, y)
    visit(x, y - 1)
    visit(x, y + 1)
  }

  const touchesOutside = (x, y) =>
    (x > 0 && outside[y * width + x - 1]) ||
    (x < width - 1 && outside[y * width + x + 1]) ||
    (y > 0 && outside[(y - 1) * width + x]) ||
    (y < height - 1 && outside[(y + 1) * width + x])

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = y * width + x
      const alphaIndex = pixel * 4 + 3

      if (outside[pixel]) {
        data[alphaIndex] = 0
        continue
      }

      if (touchesOutside(x, y)) {
        const light = lightness(pixel)
        if (light > EDGE_SOFT_LO) {
          const t = Math.min(1, (light - EDGE_SOFT_LO) / (WHITE_MIN - EDGE_SOFT_LO))
          data[alphaIndex] = Math.round(255 * (1 - t))
        }
      }

      if (data[alphaIndex] > TRIM_ALPHA) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < 0) {
    throw new Error('keying left nothing opaque — the frame was not white seamless')
  }

  const margin = Math.max(TRIM_MARGIN_MIN, Math.round(Math.max(width, height) * TRIM_MARGIN_RATIO))
  const left = Math.max(0, minX - margin)
  const top = Math.max(0, minY - margin)

  return sharp(data, { raw: { width, height, channels: 4 } })
    .extract({
      left,
      top,
      width: Math.min(width - left, maxX - minX + 1 + margin * 2),
      height: Math.min(height - top, maxY - minY + 1 + margin * 2),
    })
    .png()
    .toBuffer()
}

/**
 * Encodes to WebP at the highest quality that still fits the budget.
 *
 * Binary search rather than a step-down loop: it probes at the specified 80
 * first, then narrows, so a slot that is comfortably small climbs to use the
 * headroom instead of sitting at 80 by default. Returns the best buffer seen,
 * plus every probe so the log can show the work.
 */
async function encodeWebp(master, { transparent }) {
  const render = (quality) =>
    sharp(master)
      .webp({
        quality,
        effort: WEBP_EFFORT,
        // Cut-out edges go to mush if alpha is quantised alongside colour.
        ...(transparent ? { alphaQuality: 100 } : {}),
      })
      .toBuffer()

  let low = WEBP_MIN_Q
  let high = WEBP_MAX_Q
  let quality = WEBP_START_Q
  let best = null
  const probes = []

  for (let probe = 0; probe < WEBP_MAX_PROBES && low <= high; probe++) {
    const buffer = await render(quality)
    probes.push(`q${quality}=${Math.round(buffer.length / 1024)}k`)

    if (buffer.length <= WEBP_TARGET_BYTES) {
      if (!best || quality > best.quality) best = { buffer, quality }
      low = quality + 1
    } else {
      high = quality - 1
    }
    quality = Math.round((low + high) / 2)
  }

  if (best) return { ...best, probes, overBudget: false }

  // Nothing fit. Ship the floor rather than nothing, and say so — this slot
  // needs a resize, not more quality tuning.
  const buffer = await render(WEBP_MIN_Q)
  probes.push(`q${WEBP_MIN_Q}=${Math.round(buffer.length / 1024)}k`)
  return { buffer, quality: WEBP_MIN_Q, probes, overBudget: true }
}

const webpPath = (file) => file.replace(/\.png$/i, '.webp')

function logSlot(status, slot, bytes, note) {
  const line = [
    status.padEnd(9),
    slot.id.padEnd(34),
    slot.ratio.padEnd(6),
    formatBytes(bytes).padStart(9),
  ].join(' ')
  console.log(note ? `${line}  ${note}` : line)
}

async function processSlot(ai, slot, options) {
  const rawPath = join(RAW_DIR, slot.file)
  const outPath = join(IMAGES_DIR, webpPath(slot.file))

  if (!options.force && existsSync(outPath)) {
    const { size } = await stat(outPath)
    logSlot('skipped', slot, size)
    return { status: 'skipped', slot }
  }

  if (options.dryRun) {
    const reusable = !options.force && existsSync(rawPath)
    logSlot(
      'planned',
      slot,
      0,
      [reusable ? 're-encode from raw, no API call' : '', slot.transparent ? 'key to alpha' : '']
        .filter(Boolean)
        .join(' · '),
    )
    return { status: 'planned', slot }
  }

  // A raw already on disk means the model has been paid for. Re-encode from
  // it unless --force explicitly asks for a new generation.
  let rawBuffer = null
  let reusedRaw = false
  if (!options.force && existsSync(rawPath)) {
    rawBuffer = await readFile(rawPath)
    reusedRaw = true
  }

  let lastError
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      if (!rawBuffer) {
        rawBuffer = await generateImage(ai, slot)
        await mkdir(dirname(rawPath), { recursive: true })
        await writeFile(rawPath, rawBuffer)
      }

      // The raw stays exactly as the model returned it; keying happens on the
      // way to the shipped file, so the threshold can be retuned for free.
      const master = slot.transparent ? await keyWhiteToAlpha(rawBuffer) : rawBuffer
      const encoded = await encodeWebp(master, slot)

      await mkdir(dirname(outPath), { recursive: true })
      await writeFile(outPath, encoded.buffer)

      const note = [
        `q${encoded.quality}`,
        `[${encoded.probes.join(' ')}]`,
        reusedRaw ? 'reused raw' : '',
        attempt > 1 ? `attempt ${attempt}` : '',
        encoded.overBudget ? 'OVER BUDGET — needs a resize' : '',
      ]
        .filter(Boolean)
        .join(' ')

      logSlot('ok', slot, encoded.buffer.length, note)
      return {
        status: 'generated',
        slot,
        bytes: encoded.buffer.length,
        quality: encoded.quality,
        overBudget: encoded.overBudget,
        // A re-encode costs nothing, so it must not count toward the bill.
        billable: !reusedRaw,
      }
    } catch (error) {
      lastError = error
      if (attempt < MAX_ATTEMPTS) {
        // Jitter so three workers retrying together do not sync up.
        await sleep(BACKOFF_MS[attempt - 1] + Math.floor(Math.random() * 500))
      }
    }
  }

  logSlot('failed', slot, 0, lastError?.message ?? 'unknown error')
  return { status: 'failed', slot, error: lastError?.message ?? 'unknown error' }
}

async function pool(items, limit, worker) {
  const results = new Array(items.length)
  let next = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = next++
      if (index >= items.length) return
      results[index] = await worker(items[index])
    }
  })
  await Promise.all(runners)
  return results
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  let slots = SLOTS
  if (options.only) {
    const known = new Set(SLOTS.map((slot) => slot.id))
    const unknown = options.only.filter((id) => !known.has(id))
    if (unknown.length) fail(`Unknown slot id(s): ${unknown.join(', ')}`)
    const wanted = new Set(options.only)
    slots = SLOTS.filter((slot) => wanted.has(slot.id))
  }

  const apiKey = options.dryRun ? 'dry-run' : loadApiKey()
  const ai = new GoogleGenAI({ apiKey })

  console.log(
    `\n${slots.length} of ${TOTAL} slots · model ${MODEL} · concurrency ${CONCURRENCY}` +
      `${options.force ? ' · force' : ''}${options.dryRun ? ' · dry run' : ''}\n`,
  )

  const started = Date.now()
  const results = await pool(slots, CONCURRENCY, (slot) => processSlot(ai, slot, options))

  const generated = results.filter((r) => r.status === 'generated')
  const skipped = results.filter((r) => r.status === 'skipped')
  const failed = results.filter((r) => r.status === 'failed')
  const billed = generated.filter((r) => r.billable)
  const overBudget = generated.filter((r) => r.overBudget)
  const elapsed = ((Date.now() - started) / 1000).toFixed(0)

  console.log(
    `\n${slots.length} slots in ${elapsed}s · generated ${generated.length} · ` +
      `skipped ${skipped.length} · failed ${failed.length}`,
  )

  if (generated.length) {
    const bytes = generated.reduce((sum, r) => sum + r.bytes, 0)
    const qualities = generated.map((r) => r.quality)
    console.log(
      `webp ${formatBytes(bytes)} total, ${formatBytes(Math.round(bytes / generated.length))} average · ` +
        `quality ${Math.min(...qualities)}–${Math.max(...qualities)}`,
    )
  }

  console.log(
    `estimated cost $${(billed.length * USD_PER_IMAGE).toFixed(2)} ` +
      `(${billed.length} × $${USD_PER_IMAGE.toFixed(4)}, estimate only)` +
      `${generated.length - billed.length ? ` · ${generated.length - billed.length} re-encoded free` : ''}`,
  )

  if (overBudget.length) {
    console.log(
      `\nover ${WEBP_TARGET_BYTES / 1024} kB even at q${WEBP_MIN_Q} — these need resizing, not quality:\n  ` +
        overBudget.map((r) => r.slot.id).join('\n  '),
    )
  }

  if (failed.length) {
    const ids = failed.map((r) => r.slot.id)
    console.log(`\nfailed ids:\n  ${ids.join('\n  ')}`)
    console.log(`\nre-run just those:\n  npm run images -- --only ${ids.join(',')}\n`)
    process.exitCode = 1
  } else {
    console.log('')
  }
}

await main()
