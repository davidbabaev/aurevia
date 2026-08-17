#!/usr/bin/env node
/**
 * Composites every keyed cut-out over both backgrounds it will actually sit on
 * and writes two contact sheets you can look at.
 *
 *   node scripts/verify-cutouts.mjs [outDir]
 *
 * Alpha coverage is NOT a check. A flood fill that ate the roof off a white car
 * still reports a healthy opaque percentage — it reports the wrong shape. The
 * only check that catches that is a human looking at the subject on white
 * (which shows erased bodywork and clipped edges) and on --color-ink (which
 * shows halos and fringe the white sheet hides).
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

import sharp from 'sharp'

import { VEHICLES } from './manifest.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const IMAGES_DIR = join(ROOT, 'public', 'images')

// The two grounds the cards are used on. Ink is the obsidian band.
const GROUNDS = [
  { name: 'white', rgb: { r: 255, g: 255, b: 255 } },
  { name: 'ink', rgb: { r: 0x08, g: 0x0a, b: 0x0d } },
]

const CELL_W = 520
const CELL_H = 390
const COLS = 3
const GUTTER = 8

async function main() {
  const outDir = process.argv[2] ?? join(ROOT, '.verify')
  await mkdir(outDir, { recursive: true })

  const cards = VEHICLES.map((v) => ({
    slug: v.slug,
    path: join(IMAGES_DIR, 'vehicles', v.slug, 'card.webp'),
  })).filter((c) => {
    if (existsSync(c.path)) return true
    console.log(`missing: ${c.slug}`)
    return false
  })

  for (const ground of GROUNDS) {
    const cells = await Promise.all(
      cards.map(async (card) => {
        // contain, not cover — a cut-out cropped to fill would hide exactly the
        // clipped edge we are looking for.
        const cell = await sharp(card.path)
          .resize(CELL_W, CELL_H, {
            fit: 'contain',
            background: { ...ground.rgb, alpha: 1 },
          })
          .flatten({ background: ground.rgb })
          .toBuffer()
        return { slug: card.slug, cell }
      }),
    )

    const rows = Math.ceil(cells.length / COLS)
    const sheet = sharp({
      create: {
        width: COLS * CELL_W + (COLS + 1) * GUTTER,
        height: rows * CELL_H + (rows + 1) * GUTTER,
        channels: 3,
        background: { r: 255, g: 0, b: 255 },
      },
    })

    const composites = cells.map(({ cell }, index) => ({
      input: cell,
      left: GUTTER + (index % COLS) * (CELL_W + GUTTER),
      top: GUTTER + Math.floor(index / COLS) * (CELL_H + GUTTER),
    }))

    const buffer = await sheet.composite(composites).png().toBuffer()
    const file = join(outDir, `cutouts-on-${ground.name}.png`)
    await writeFile(file, buffer)
    console.log(`${file}  ${cells.length} cards, ${COLS}x${rows}`)
  }

  console.log(`\norder, left to right, top to bottom:\n  ${cards.map((c) => c.slug).join('\n  ')}`)
}

await main()
