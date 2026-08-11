#!/usr/bin/env node
/**
 * Generates every image in scripts/manifest.mjs into public/images/.
 *
 *   npm run images                      generate whatever is missing
 *   npm run images -- --force           regenerate everything
 *   npm run images -- --reencode        rebuild shipped files from the raws
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
// The background is found by flood filling inward from the corners, never by
// thresholding the whole image: a white car body is light but is not
// connected to the frame edge, so connectivity is what protects it.
//
// The threshold is derived per image rather than fixed. A fixed 236 failed on
// all 12 cut-outs because the model's "white seamless" carries a vignette —
// most of the backdrop sits below 236, so the fill never reached the car and
// only a band along the bottom came away.
const CORNER_SAMPLE = 16
// Tolerances tried below the sampled corner level, tightest first.
const TOLERANCES = [4, 8, 12, 16, 20, 26, 32, 40, 50, 62, 76, 92]
// A fill covering more than this is eating the car, not the backdrop.
const FILL_CEILING = 0.94
// A jump this large between consecutive tolerances means the fill just leaked
// through the silhouette. Take the step before it.
const FILL_LEAK_JUMP = 0.14
// Below this the fill has clearly not reached round the car yet.
const FILL_FLOOR = 0.12
// The fill refuses to cross a pixel whose local gradient exceeds this. Level
// alone cannot separate a white roof from a white backdrop — they are the same
// brightness — but the boundary between them is a hard edge and the backdrop
// is smooth. Without this the fill runs over the roof of the white cars and
// eats the glass from the inside.
const EDGE_GUARD = 16
// Opaque islands smaller than this are keying specks, not the car. Left in,
// a single stray corner pixel drags the trim box out to the frame edge.
const SPECK_FRACTION = 0.01
// The fill can still leak into a white car through the roof, where body and
// backdrop are the same brightness and the boundary is soft. It gets in
// through a narrow neck, so opening the background mask by this radius severs
// anything thinner than 2x it while leaving the real backdrop untouched.
const MASK_OPEN_RADIUS = 7

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
 * Keys the white seamless to alpha, de-halos the edge and trims to the
 * subject with a guaranteed margin.
 *
 * Background is found by flood filling from the corners rather than by
 * thresholding the whole image, which is what keeps a white car opaque: its
 * body is light but it is not connected to the frame edge.
 *
 * Returns diagnostics alongside the buffer so the log can show which
 * threshold each image needed and whether the subject ran off frame.
 */
async function keyWhiteToAlpha(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height } = info
  const total = width * height
  const lightness = (pixel) => {
    const i = pixel * 4
    return Math.min(data[i], data[i + 1], data[i + 2])
  }

  // What is the backdrop actually made of? Read it off the four corners
  // rather than assuming. The median resists a stray dark speck; the minimum
  // across the four corners keeps a vignetted corner from raising the bar.
  const cornerLevel = () => {
    const levels = []
    for (const [ox, oy] of [
      [0, 0],
      [width - CORNER_SAMPLE, 0],
      [0, height - CORNER_SAMPLE],
      [width - CORNER_SAMPLE, height - CORNER_SAMPLE],
    ]) {
      const block = []
      for (let y = oy; y < oy + CORNER_SAMPLE; y++) {
        for (let x = ox; x < ox + CORNER_SAMPLE; x++) block.push(lightness(y * width + x))
      }
      block.sort((a, b) => a - b)
      levels.push(block[Math.floor(block.length / 2)])
    }
    return Math.min(...levels)
  }

  const backdrop = cornerLevel()

  // Local gradient, used as a barrier below. Cheap 4-neighbour maximum
  // difference; the backdrop reads near zero and any real edge reads high.
  const gradient = new Uint8Array(total)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = y * width + x
      const here = lightness(pixel)
      let peak = 0
      if (x > 0) peak = Math.max(peak, Math.abs(here - lightness(pixel - 1)))
      if (x < width - 1) peak = Math.max(peak, Math.abs(here - lightness(pixel + 1)))
      if (y > 0) peak = Math.max(peak, Math.abs(here - lightness(pixel - width)))
      if (y < height - 1) peak = Math.max(peak, Math.abs(here - lightness(pixel + width)))
      gradient[pixel] = Math.min(255, peak)
    }
  }

  // Flood fill from all four corners at a given threshold. Seeding the corners
  // rather than the whole border lets a car that runs off the edge of frame act
  // as a wall; the corner seeds still reach right round the backdrop.
  const fillAt = (threshold) => {
    const mask = new Uint8Array(total)
    const stack = []
    const visit = (x, y) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return
      const pixel = y * width + x
      if (mask[pixel]) return
      if (lightness(pixel) < threshold) return
      if (gradient[pixel] > EDGE_GUARD) return
      mask[pixel] = 1
      stack.push(pixel)
    }
    for (const [x, y] of [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1],
    ]) {
      visit(x, y)
    }
    let filled = 0
    while (stack.length) {
      const pixel = stack.pop()
      filled++
      const x = pixel % width
      const y = (pixel - x) / width
      visit(x - 1, y)
      visit(x + 1, y)
      visit(x, y - 1)
      visit(x, y + 1)
    }
    return { mask, fraction: filled / total }
  }

  // Relax the threshold until the fill has reached round the silhouette, and
  // stop the step before it leaks through into the car.
  let chosen = null
  let previous = 0
  let usedTolerance = null
  for (const tolerance of TOLERANCES) {
    const threshold = Math.max(1, backdrop - tolerance)
    const attempt = fillAt(threshold)
    if (attempt.fraction > FILL_CEILING) break
    if (chosen && attempt.fraction - previous > FILL_LEAK_JUMP) break
    chosen = attempt
    previous = attempt.fraction
    usedTolerance = tolerance
    // Once the backdrop is comfortably covered there is nothing to gain by
    // relaxing further, and every extra step risks the leak.
    if (attempt.fraction > 0.35) break
  }

  if (!chosen || chosen.fraction < FILL_FLOOR) {
    throw new Error(
      `keying could not separate the backdrop (corner level ${backdrop}, best fill ` +
        `${chosen ? (chosen.fraction * 100).toFixed(1) : '0'}%) — the frame was not white seamless`,
    )
  }

  // Open the background mask: erode, keep what still reaches the border,
  // dilate back, then intersect with the original so nothing grows into the
  // car. Square structuring element, applied separably.
  const morph = (mask, radius, keepMax) => {
    const pass = (src, horizontal) => {
      const out = new Uint8Array(total)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let value = keepMax ? 0 : 1
          for (let d = -radius; d <= radius; d++) {
            const nx = horizontal ? x + d : x
            const ny = horizontal ? y : y + d
            const inside = nx >= 0 && ny >= 0 && nx < width && ny < height
            // Outside the canvas counts as background, so erosion does not
            // eat the mask away from the frame edge.
            const v = inside ? src[ny * width + nx] : 1
            value = keepMax ? Math.max(value, v) : Math.min(value, v)
          }
          out[y * width + x] = value
        }
      }
      return out
    }
    return pass(pass(mask, true), false)
  }

  const eroded = morph(chosen.mask, MASK_OPEN_RADIUS, false)

  // Only the eroded background that still touches the frame edge is real.
  const anchored = new Uint8Array(total)
  {
    const stack = []
    const seed = (x, y) => {
      const pixel = y * width + x
      if (anchored[pixel] || !eroded[pixel]) return
      anchored[pixel] = 1
      stack.push(pixel)
    }
    for (let x = 0; x < width; x++) {
      seed(x, 0)
      seed(x, height - 1)
    }
    for (let y = 0; y < height; y++) {
      seed(0, y)
      seed(width - 1, y)
    }
    while (stack.length) {
      const pixel = stack.pop()
      const x = pixel % width
      const y = (pixel - x) / width
      if (x > 0) seed(x - 1, y)
      if (x < width - 1) seed(x + 1, y)
      if (y > 0) seed(x, y - 1)
      if (y < height - 1) seed(x, y + 1)
    }
  }

  const reopened = morph(anchored, MASK_OPEN_RADIUS, true)
  const outside = new Uint8Array(total)
  for (let p = 0; p < total; p++) outside[p] = chosen.mask[p] && reopened[p] ? 1 : 0

  const nearOutside = (x, y) =>
    (x > 0 && outside[y * width + x - 1]) ||
    (x < width - 1 && outside[y * width + x + 1]) ||
    (y > 0 && outside[(y - 1) * width + x]) ||
    (y < height - 1 && outside[(y + 1) * width + x])

  // De-halo. A fringe pixel is part backdrop and part car, so give it partial
  // alpha AND take the backdrop's contribution back out of its colour.
  // Without the unpremultiply the edge keeps a white rim on every card.
  const fringeFloor = Math.max(1, backdrop - 90)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = y * width + x
      const i = pixel * 4

      if (outside[pixel]) {
        data[i + 3] = 0
        continue
      }

      if (nearOutside(x, y)) {
        const light = lightness(pixel)
        if (light > fringeFloor) {
          const alpha = Math.max(0, Math.min(1, (backdrop - light) / (backdrop - fringeFloor)))
          data[i + 3] = Math.round(255 * alpha)
          if (alpha > 0.02) {
            for (let c = 0; c < 3; c++) {
              const unmixed = (data[i + c] - backdrop * (1 - alpha)) / alpha
              data[i + c] = Math.max(0, Math.min(255, Math.round(unmixed)))
            }
          }
        }
      }
    }
  }

  // Drop keying specks. The threshold is generous rather than "keep the
  // largest": punched-out glass can split a car into more than one component,
  // and deleting its roof would be a worse bug than leaving a speck.
  const minIsland = Math.round(total * SPECK_FRACTION)
  const seen = new Uint8Array(total)
  for (let start = 0; start < total; start++) {
    if (seen[start] || data[start * 4 + 3] <= TRIM_ALPHA) continue
    const island = []
    const queue = [start]
    seen[start] = 1
    while (queue.length) {
      const pixel = queue.pop()
      island.push(pixel)
      const x = pixel % width
      const y = (pixel - x) / width
      const push = (nx, ny) => {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) return
        const next = ny * width + nx
        if (seen[next] || data[next * 4 + 3] <= TRIM_ALPHA) return
        seen[next] = 1
        queue.push(next)
      }
      push(x - 1, y)
      push(x + 1, y)
      push(x, y - 1)
      push(x, y + 1)
    }
    if (island.length < minIsland) {
      for (const pixel of island) data[pixel * 4 + 3] = 0
    }
  }

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

  if (maxX < 0) {
    throw new Error('keying left nothing opaque — the frame was not white seamless')
  }

  // Trim to the subject, then guarantee the margin. Clamping alone silently
  // dropped it whenever the subject reached the frame edge, which is why the
  // earlier cut-outs all had opaque pixels sitting on the canvas border.
  const margin = Math.max(TRIM_MARGIN_MIN, Math.round(Math.max(width, height) * TRIM_MARGIN_RATIO))
  const left = Math.max(0, minX - margin)
  const top = Math.max(0, minY - margin)
  const right = Math.min(width - 1, maxX + margin)
  const bottom = Math.min(height - 1, maxY + margin)

  const clipped =
    minX === 0 || minY === 0 || maxX === width - 1 || maxY === height - 1

  const trimmed = await sharp(data, { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .png()
    .toBuffer()

  // Pad back whatever the clamp could not give us, in transparent pixels.
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

  return { buffer, backdrop, tolerance: usedTolerance, removed: chosen.fraction, clipped }
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

      // The raw stays exactly as the model returned it; keying happens on the
      // way to the shipped file, so the threshold can be retuned for free.
      let keyed = null
      let master = rawBuffer
      if (slot.transparent) {
        keyed = await keyWhiteToAlpha(rawBuffer)
        master = keyed.buffer
      }
      const encoded = await encodeWebp(master, slot)

      await mkdir(dirname(outPath), { recursive: true })
      await writeFile(outPath, encoded.buffer)

      const note = [
        `q${encoded.quality}`,
        keyed ? `key bg${keyed.backdrop}-${keyed.tolerance} cut ${(keyed.removed * 100).toFixed(0)}%` : '',
        keyed?.clipped ? 'SUBJECT RUNS OFF FRAME' : '',
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
        clipped: keyed?.clipped ?? false,
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

  // A re-encode never reaches the network, so it must not demand a key.
  const offline = options.dryRun || options.reencode
  const apiKey = offline ? 'offline' : loadApiKey()
  const ai = new GoogleGenAI({ apiKey })

  console.log(
    `\n${slots.length} of ${TOTAL} slots · model ${MODEL} · concurrency ${CONCURRENCY}` +
      `${options.force ? ' · force' : ''}${options.reencode ? ' · re-encode from raws, no API' : ''}` +
      `${options.dryRun ? ' · dry run' : ''}\n`,
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
