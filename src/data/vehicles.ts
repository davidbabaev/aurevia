// Aurevia Premium Motors — vehicle content.
//
// Mirrors the twelve vehicles in scripts/manifest.mjs, which is the source
// of truth for what imagery exists. Keep the slugs in step: the detail page
// builds image paths from them.
//
// `colours` is the exterior swatch row. The first entry is the car's own
// paint and its cut-out is card.webp; the other four are the variants and
// their cut-outs are colour-<slugified name>.webp in the same folder.
//
// Prices, specifications and copy are NOT here yet. Add them as [REPLACE]
// when the detail page needs them — never invent them.

export type Vehicle = {
  slug: string
  brand: string
  name: string
  type: 'sedan' | 'suv' | 'sports'
  /** Exterior swatches. Index 0 is the primary colour, shown as card.webp. */
  colours: string[]
}

export const VEHICLES: Vehicle[] = [
  {
    slug: 'mercedes-benz-s-580',
    brand: 'Mercedes-Benz',
    name: 'Mercedes-Benz S 580',
    type: 'sedan',
    colours: ['obsidian black metallic', 'graphite grey', 'glacier white', 'silver', 'deep navy'],
  },
  {
    slug: 'mercedes-amg-gle-53',
    brand: 'Mercedes-Benz',
    name: 'Mercedes-AMG GLE 53',
    type: 'suv',
    colours: ['polar white', 'obsidian black', 'graphite grey', 'silver', 'deep navy'],
  },
  {
    slug: 'mercedes-amg-gt-63',
    brand: 'Mercedes-Benz',
    name: 'Mercedes-AMG GT 63',
    type: 'sports',
    colours: ['matte graphite grey', 'obsidian black', 'glacier white', 'silver', 'deep navy'],
  },
  {
    slug: 'audi-a7-sportback',
    brand: 'Audi',
    name: 'Audi A7 Sportback',
    type: 'sedan',
    colours: ['daytona grey', 'obsidian black', 'glacier white', 'silver', 'deep navy'],
  },
  {
    slug: 'audi-q8',
    brand: 'Audi',
    name: 'Audi Q8',
    type: 'suv',
    colours: ['glacier white', 'obsidian black', 'graphite grey', 'silver', 'deep navy'],
  },
  {
    slug: 'audi-rs-e-tron-gt',
    brand: 'Audi',
    name: 'Audi RS e-tron GT',
    type: 'sports',
    colours: ['mythos black metallic', 'graphite grey', 'glacier white', 'silver', 'deep navy'],
  },
  {
    slug: 'bmw-i4-m50',
    brand: 'BMW',
    name: 'BMW i4 M50',
    type: 'sedan',
    colours: ['mineral white', 'obsidian black', 'graphite grey', 'silver', 'deep navy'],
  },
  {
    slug: 'bmw-x7',
    brand: 'BMW',
    name: 'BMW X7',
    type: 'suv',
    colours: ['carbon black metallic', 'graphite grey', 'glacier white', 'silver', 'deep navy'],
  },
  {
    slug: 'bmw-m4-competition',
    brand: 'BMW',
    name: 'BMW M4 Competition',
    type: 'sports',
    colours: ['brilliant white', 'obsidian black', 'graphite grey', 'silver', 'deep navy'],
  },
  {
    slug: 'porsche-taycan',
    brand: 'Porsche',
    name: 'Porsche Taycan',
    type: 'sedan',
    colours: ['volcano grey metallic', 'obsidian black', 'glacier white', 'silver', 'deep navy'],
  },
  {
    slug: 'porsche-cayenne',
    brand: 'Porsche',
    name: 'Porsche Cayenne',
    type: 'suv',
    colours: ['jet black metallic', 'graphite grey', 'glacier white', 'silver', 'deep navy'],
  },
  {
    slug: 'porsche-911-carrera',
    brand: 'Porsche',
    name: 'Porsche 911 Carrera',
    type: 'sports',
    colours: ['agate grey metallic', 'obsidian black', 'glacier white', 'silver', 'deep navy'],
  },
]
