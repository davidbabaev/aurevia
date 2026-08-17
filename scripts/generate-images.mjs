#!/usr/bin/env node
/**
 * Generates every image in scripts/manifest.mjs into public/images/.
 *
 *   npm run images                      generate whatever is missing
 *   npm run images -- --force           regenerate everything
 *   npm run images -- --reencode        rebuild shipped files from cache
 *   npm run images -- --only id,id      generate named slots only
 *   npm run images -- --dry-run         print the plan, call nothing
 *
 * Up to three artefacts per slot, both intermediates gitignored:
 *   public/images/_raw/     the model's untouched PNG
 *   public/images/_keyed/   remove.bg's cut-out, for transparent slots only
 *   public/images/          the shipped WebP
 *
 * Both intermediates are kept because both were paid for. A change to the
 * trim margin or to WebP quality costs CPU rather than 70 model calls and 12
 * remove.bg credits — if the intermediates are on disk and the WebP is not,
 * the slot rebuilds without going near the network.
 *
 * The run is resumable by design: a slot whose WebP already exists is
 * skipped, so a run that dies at image 58 costs 12 images to finish, not 70.
 * A slot that fails is retried twice and then recorded — one bad prompt never
 * takes the run down with it. A terminal remove.bg error is not retried at
 * all, because a second call would spend a second credit to be told the same
 * thing. Failed ids are printed at the end in a form you can paste straight
 * back into --only.
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
// remove.bg output, cached beside the raw. Metered, so it is kept for the same
// reason the raw is: retrimming or re-encoding must never re-bill the API.
const KEYED_DIR = join(IMAGES_DIR, '_keyed')

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
// remove.bg does the keying. There is no local fallback and there must not
// be one: the flood fill this replaced separated subject from backdrop by
// colour distance, which is exactly the measurement that does not exist on a
// light car, and it chewed the roofs, doors and rear quarters off the white
// and silver cars while still reporting a healthy opaque percentage. A
// fallback that silently produced that output would be worse than a slot that
// fails loudly, so a keying failure is a failure.
//
// The account is metered. Every call is cached to _keyed/ and a cut-out whose
// keyed PNG is already on disk never calls the API again — only --force does.
const REMOVEBG_ENDPOINT = 'https://api.remove.bg/v1.0/removebg'
// full, not the default preview: preview returns roughly 0.25MP and would
// throw away most of the frame the model was paid to compose.
const REMOVEBG_SIZE = 'full'
// Only these are worth a second call. Everything else — a bad key, an
// exhausted account, a rejected image — fails the same way twice and the
// retry would just spend another credit.
const REMOVEBG_RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])

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
  const options = { force: false, dryRun: false, reencode: false, only: null }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--force') options.force = true
    else if (arg === '--dry-run') options.dryRun = true
    else if (arg === '--reencode') options.reencode = true
    else if (arg === '--only') options.only = splitIds(argv[++i])
    else if (arg.startsWith('--only=')) options.only = splitIds(arg.slice(7))
    else fail(`Unknown argument: ${arg}`)
  }
  if (options.reencode && options.force) {
    fail('--reencode and --force contradict each other: one rebuilds from raws, the other regenerates.')
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

function loadApiKey(name) {
  if (!process.env[name]) {
    try {
      process.loadEnvFile(join(ROOT, '.env'))
    } catch {
      // Fall through to the check below, which gives the actionable message.
    }
  }
  const key = process.env[name]?.trim()
  if (!key) {
    fail(
      `${name} is not set.\n` +
        '  Add it to .env at the repo root:\n' +
        `    ${name}=your-key-here\n` +
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
 * Keys one raw through remove.bg and returns the PNG it sends back, untouched.
 *
 * Trimming and encoding happen afterwards and separately, so the cached copy
 * on disk is exactly what was paid for — a change to the margin or to WebP
 * quality costs CPU, never another credit.
 */
async function removeBackground(input, apiKey) {
  const form = new FormData()
  form.append('image_file', new Blob([input], { type: 'image/png' }), 'card.png')
  form.append('size', REMOVEBG_SIZE)
  form.append('format', 'png')

  let response
  try {
    response = await fetch(REMOVEBG_ENDPOINT, {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: form,
    })
  } catch (cause) {
    // The request never landed, so nothing was charged. Worth another go.
    const error = new Error(`remove.bg unreachable: ${cause.message}`)
    error.retryable = true
    throw error
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    let detail = body.slice(0, 200)
    try {
      const parsed = JSON.parse(body)
      const errors = parsed?.errors ?? []
      if (errors.length) {
        detail = errors.map((e) => [e.code, e.title].filter(Boolean).join(' ')).join('; ')
      }
    } catch {
      // Not JSON. The truncated body is the best detail available.
    }
    const error = new Error(`remove.bg ${response.status}${detail ? `: ${detail}` : ''}`)
    error.retryable = REMOVEBG_RETRYABLE_STATUS.has(response.status)
    throw error
  }

  const buffer = Buffer.from(await response.arrayBuffer())

  // Confirm it is a decodable PNG that actually carries alpha before it is
  // cached. A cached non-image would be read back forever as if it were good.
  const meta = await sharp(buffer).metadata()
  if (!meta.hasAlpha) {
    const error = new Error(`remove.bg returned an image with no alpha channel (${meta.format})`)
    error.retryable = false
    throw error
  }

  return {
    buffer,
    width: meta.width,
    height: meta.height,
    // remove.bg reports what it billed. Worth printing on a metered account.
    credits: Number(response.headers.get('x-credits-charged') ?? 0),
  }
}

/**
 * Trims a keyed PNG to its subject and guarantees a margin of transparent
 * pixels on all four sides.
 *
 * Clamping alone silently dropped the margin whenever the subject reached the
 * frame edge, which is why an earlier set of cut-outs had opaque pixels sitting
 * on the canvas border; whatever the clamp cannot give is padded back.
 */
async function trimToSubject(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height } = info
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > TRIM_ALPHA) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < 0) throw new Error('the keyed image is fully transparent — nothing was cut out')

  const margin = Math.max(TRIM_MARGIN_MIN, Math.round(Math.max(width, height) * TRIM_MARGIN_RATIO))
  const left = Math.max(0, minX - margin)
  const top = Math.max(0, minY - margin)
  const right = Math.min(width - 1, maxX + margin)
  const bottom = Math.min(height - 1, maxY + margin)

  // The subject touching the border means remove.bg cut something the model
  // had already run off the edge of frame. Reported, not corrected.
  const clipped = minX === 0 || minY === 0 || maxX === width - 1 || maxY === height - 1

  const trimmed = await sharp(data, { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .png()
    .toBuffer()

  const padLeft = margin - (minX - left)
  const padTop = margin - (minY - top)
  const padRight = margin - (right - maxX)
  const padBottom = margin - (bottom - maxY)

  const buffer =
    padLeft || padTop || padRight || padBottom
      ? await sharp(trimmed)
          .extend({
            left: padLeft,
            top: padTop,
            right: padRight,
            bottom: padBottom,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toBuffer()
      : trimmed

  return { buffer, clipped, subject: { width: maxX - minX + 1, height: maxY - minY + 1 } }
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

async function processSlot(ai, removeBgKey, slot, options) {
  const rawPath = join(RAW_DIR, slot.file)
  const keyedPath = join(KEYED_DIR, slot.file)
  const outPath = join(IMAGES_DIR, webpPath(slot.file))
  const offline = options.dryRun || options.reencode

  if (options.reencode && !existsSync(rawPath)) {
    logSlot('failed', slot, 0, 'no raw on disk to re-encode from')
    return { status: 'failed', slot, error: 'no raw on disk' }
  }

  if (!options.force && !options.reencode && existsSync(outPath)) {
    const { size } = await stat(outPath)
    logSlot('skipped', slot, size)
    return { status: 'skipped', slot }
  }

  if (options.dryRun) {
    const reusable = options.reencode || (!options.force && existsSync(rawPath))
    const keyable = !options.force && existsSync(keyedPath)
    logSlot(
      'planned',
      slot,
      0,
      [
        reusable ? 're-encode from raw, no model call' : 'generate',
        slot.transparent ? (keyable ? 'key from cache, no credit' : 'remove.bg, 1 credit') : '',
      ]
        .filter(Boolean)
        .join(' · '),
    )
    return { status: 'planned', slot }
  }

  // A raw already on disk means the model has been paid for. Re-encode from
  // it unless --force explicitly asks for a new generation. --reencode is the
  // same path made explicit: rebuild the shipped file from raws, never call
  // the API, so a keying or quality change cannot cost anything.
  let rawBuffer = null
  let reusedRaw = false
  if (options.reencode || (!options.force && existsSync(rawPath))) {
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

      // The raw stays exactly as the model returned it. Keying is a second
      // paid artefact cached beside it, so a change to the margin or to WebP
      // quality costs CPU and never another remove.bg credit.
      let trimmed = null
      let master = rawBuffer
      let keyedSource = null
      if (slot.transparent) {
        if (!options.force && existsSync(keyedPath)) {
          keyedSource = 'cached'
        } else if (offline) {
          // --reencode and --dry-run promise not to touch the network. A
          // transparent slot with no cached key cannot be honoured offline.
          const error = new Error('no keyed PNG on disk and --reencode must not call remove.bg')
          error.retryable = false
          throw error
        } else {
          const cut = await removeBackground(rawBuffer, removeBgKey)
          await mkdir(dirname(keyedPath), { recursive: true })
          await writeFile(keyedPath, cut.buffer)
          keyedSource = `remove.bg ${cut.width}x${cut.height}`
          if (cut.credits) keyedSource += ` ${cut.credits}cr`
        }
        trimmed = await trimToSubject(await readFile(keyedPath))
        master = trimmed.buffer
      }
      const encoded = await encodeWebp(master, slot)

      await mkdir(dirname(outPath), { recursive: true })
      await writeFile(outPath, encoded.buffer)

      const note = [
        `q${encoded.quality}`,
        keyedSource ?? '',
        trimmed ? `subject ${trimmed.subject.width}x${trimmed.subject.height}` : '',
        trimmed?.clipped ? 'SUBJECT RUNS OFF FRAME' : '',
        reusedRaw ? 'from raw' : '',
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
        clipped: trimmed?.clipped ?? false,
        // A re-encode costs nothing, so it must not count toward the bill.
        billable: !reusedRaw,
      }
    } catch (error) {
      lastError = error
      // A terminal remove.bg error fails the same way twice. Retrying a bad
      // key or an exhausted account would spend another credit to learn
      // nothing, so stop here and let the id be reported.
      if (error.retryable === false) break
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

  // A re-encode never reaches the network, so it must not demand a key.
  // remove.bg's key is only demanded when a transparent slot is actually in
  // play and its keyed PNG is not already cached — otherwise a run of opaque
  // slots would refuse to start over a key it was never going to use.
  const offline = options.dryRun || options.reencode
  const apiKey = offline ? 'offline' : loadApiKey('GEMINI_API_KEY')
  const ai = new GoogleGenAI({ apiKey })

  const needsRemoveBg =
    !offline &&
    slots.some(
      (slot) =>
        slot.transparent &&
        (options.force || !existsSync(join(KEYED_DIR, slot.file))) &&
        (options.force || !existsSync(join(IMAGES_DIR, webpPath(slot.file)))),
    )
  const removeBgKey = needsRemoveBg ? loadApiKey('REMOVEBG_API_KEY') : 'offline'

  console.log(
    `\n${slots.length} of ${TOTAL} slots · model ${MODEL} · concurrency ${CONCURRENCY}` +
      `${options.force ? ' · force' : ''}${options.reencode ? ' · re-encode from cache, no API' : ''}` +
      `${options.dryRun ? ' · dry run' : ''}\n`,
  )

  const started = Date.now()
  const results = await pool(slots, CONCURRENCY, (slot) =>
    processSlot(ai, removeBgKey, slot, options),
  )

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
