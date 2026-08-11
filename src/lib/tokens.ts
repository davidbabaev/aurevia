/**
 * The registries the styleguide renders from.
 *
 * Colour values are deliberately absent — the styleguide reads them off the
 * live custom properties, so this file lists names and intent only.
 */

export interface PaletteToken {
  /** Custom property name, as declared in @theme. */
  token: string
  /** Utility suffix, e.g. "ink" gives bg-ink / text-ink. */
  name: string
  usage: string
}

export const PALETTE: PaletteToken[] = [
  { token: '--color-ink', name: 'ink', usage: 'Headings, body text, dark sections, footer' },
  { token: '--color-graphite', name: 'graphite', usage: 'Secondary dark bands, image overlays' },
  { token: '--color-bg', name: 'bg', usage: 'Page background, nav bar, cards' },
  { token: '--color-surface', name: 'surface', usage: 'Alternate sections, inventory background' },
  { token: '--color-border', name: 'border', usage: 'Dividers, input outlines — decorative on light, legible on dark' },
  { token: '--color-muted', name: 'muted', usage: 'Specs, labels, metadata' },
  { token: '--color-accent', name: 'accent', usage: 'Button fills, active tabs, selected card tint' },
  { token: '--color-sold', name: 'sold', usage: 'Sold / unavailable status' },
  { token: '--color-available', name: 'available', usage: 'Available status, form success' },
]

export interface ContrastPair {
  foreground: string
  background: string
  /** Size the pair is actually rendered at, which sets the AA threshold. */
  fontSizePx: number
  bold?: boolean
  usage: string
  /**
   * Set when the pair is on the page to prove a rule rather than to be used.
   * These are expected to fail and are not defects.
   */
  demonstratesRule?: string
  /** What to reach for instead. Shown alongside the failure. */
  insteadUse?: string
}

/**
 * Every foreground/background combination the site actually puts text in,
 * plus the two the brief calls out as forbidden so the ban is visible rather
 * than merely written down.
 */
export const CONTRAST_PAIRS: ContrastPair[] = [
  // On white.
  { foreground: 'ink', background: 'bg', fontSizePx: 64, bold: true, usage: 'Page h1 over a light band' },
  { foreground: 'ink', background: 'bg', fontSizePx: 16, usage: 'Body copy on the page background' },
  { foreground: 'graphite', background: 'bg', fontSizePx: 16, usage: 'Secondary body copy' },
  { foreground: 'muted', background: 'bg', fontSizePx: 14, usage: 'Vehicle specs and metadata on a white card' },

  // On the alternate light band.
  { foreground: 'ink', background: 'surface', fontSizePx: 40, bold: true, usage: 'Section heading on the inventory band' },
  { foreground: 'ink', background: 'surface', fontSizePx: 16, usage: 'Body copy on the inventory band' },

  // On the dark bands.
  { foreground: 'bg', background: 'ink', fontSizePx: 16, usage: 'Body copy on an obsidian band' },
  { foreground: 'bg', background: 'ink', fontSizePx: 64, bold: true, usage: 'Hero h1 over the obsidian floor' },
  { foreground: 'border', background: 'ink', fontSizePx: 14, usage: 'Metadata on an obsidian band' },
  { foreground: 'accent', background: 'ink', fontSizePx: 16, usage: 'Accent as text — permitted on obsidian only' },
  { foreground: 'bg', background: 'graphite', fontSizePx: 16, usage: 'Body copy on a graphite band' },
  { foreground: 'border', background: 'graphite', fontSizePx: 14, usage: 'Metadata on a graphite band' },

  // On accent — the signature rule.
  { foreground: 'ink', background: 'accent', fontSizePx: 16, bold: true, usage: 'Accent button label' },
  {
    foreground: 'bg',
    background: 'accent',
    fontSizePx: 16,
    bold: true,
    usage: 'Not used',
    demonstratesRule: 'Section 4 — text on an accent fill is always ink, never white',
  },

  // Status fills.
  { foreground: 'ink', background: 'available', fontSizePx: 13, bold: true, usage: 'Available status pill' },
  {
    foreground: 'bg',
    background: 'available',
    fontSizePx: 13,
    bold: true,
    usage: 'Not used',
    demonstratesRule: 'White on the available fill fails — status pills use ink',
  },
  { foreground: 'ink', background: 'sold', fontSizePx: 13, bold: true, usage: 'Sold status pill' },
  {
    foreground: 'bg',
    background: 'sold',
    fontSizePx: 13,
    bold: true,
    usage: 'Not used',
    demonstratesRule: 'White on the sold fill fails — status pills use ink',
  },

  /*
   * muted is the metadata colour, which makes these three the pairs a
   * developer reaches for by reflex. All three miss AA — the surface one by
   * 0.01 — so they are documented as traps rather than left to be discovered.
   */
  {
    foreground: 'muted',
    background: 'surface',
    fontSizePx: 14,
    usage: 'Not used',
    demonstratesRule: 'muted lands at 4.49:1 on surface — 0.01 short of AA',
    insteadUse: 'Keep metadata on a white card, or set it in ink',
  },
  {
    foreground: 'muted',
    background: 'ink',
    fontSizePx: 14,
    usage: 'Not used',
    demonstratesRule: 'muted is too dark to sit on an obsidian band',
    insteadUse: 'border — 15.09:1 on ink',
  },
  {
    foreground: 'muted',
    background: 'graphite',
    fontSizePx: 14,
    usage: 'Not used',
    demonstratesRule: 'muted is too dark to sit on a graphite band',
    insteadUse: 'border — 13.14:1 on graphite',
  },
]

export interface TypeScaleEntry {
  name: string
  /** Utility at the 1280px layout. */
  desktopClass: string
  desktopPx: number
  /** Utility at the 390px layout. */
  mobileClass: string
  mobilePx: number
  family: 'display' | 'body'
  usage: string
}

export const TYPE_SCALE: TypeScaleEntry[] = [
  { name: 'display', desktopClass: 'text-display', desktopPx: 64, mobileClass: 'text-display-sm', mobilePx: 40, family: 'display', usage: 'Page h1' },
  { name: 'h2', desktopClass: 'text-h2', desktopPx: 40, mobileClass: 'text-h2-sm', mobilePx: 28, family: 'display', usage: 'Section heading' },
  { name: 'h3', desktopClass: 'text-h3', desktopPx: 24, mobileClass: 'text-h3-sm', mobilePx: 20, family: 'display', usage: 'Vehicle name, card title' },
  { name: 'body-lg', desktopClass: 'text-body-lg', desktopPx: 18, mobileClass: 'text-body-lg-sm', mobilePx: 17, family: 'body', usage: 'Hero support paragraph' },
  { name: 'body', desktopClass: 'text-body', desktopPx: 16, mobileClass: 'text-body', mobilePx: 16, family: 'body', usage: 'Paragraphs, buttons' },
  { name: 'body-sm', desktopClass: 'text-body-sm', desktopPx: 14, mobileClass: 'text-body-sm', mobilePx: 14, family: 'body', usage: 'Specs, footer links' },
  { name: 'caption', desktopClass: 'text-caption', desktopPx: 13, mobileClass: 'text-caption', mobilePx: 13, family: 'body', usage: 'Status pills, fine print' },
  { name: 'label', desktopClass: 'text-label', desktopPx: 12, mobileClass: 'text-label', mobilePx: 12, family: 'body', usage: 'Field labels, eyebrow text' },
]
