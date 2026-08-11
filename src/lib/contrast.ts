/**
 * WCAG 2.1 contrast maths.
 *
 * Every ratio the styleguide shows is computed here from the live value of
 * the @theme token, read off the document at runtime. Nothing is written
 * down twice: change a token in index.css and the reported number moves with
 * it. That is the point — a hardcoded ratio is a number that can quietly go
 * stale the moment someone edits the palette.
 */

export interface Rgb {
  r: number
  g: number
  b: number
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i
const RGB_FUNCTION = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i

function parseHex(value: string): Rgb | null {
  const match = HEX.exec(value.trim())
  if (!match) return null
  let digits = match[1]
  if (digits.length === 3) {
    digits = digits[0] + digits[0] + digits[1] + digits[1] + digits[2] + digits[2]
  }
  return {
    r: parseInt(digits.slice(0, 2), 16),
    g: parseInt(digits.slice(2, 4), 16),
    b: parseInt(digits.slice(4, 6), 16),
  }
}

function parseRgbFunction(value: string): Rgb | null {
  const match = RGB_FUNCTION.exec(value.trim())
  if (!match) return null
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }
}

/**
 * Last resort for any colour syntax this module does not parse directly
 * (oklch, colour-mix, a named colour). Hands the string to the browser and
 * reads back what it resolved to.
 */
function parseViaBrowser(value: string): Rgb | null {
  if (typeof document === 'undefined') return null
  const probe = document.createElement('span')
  probe.style.color = value
  // An unparseable value leaves the property untouched, which would otherwise
  // read back as the inherited colour and produce a confidently wrong ratio.
  if (probe.style.color === '') return null
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  document.body.appendChild(probe)
  const computed = getComputedStyle(probe).color
  document.body.removeChild(probe)
  return parseRgbFunction(computed)
}

export function parseColor(value: string): Rgb | null {
  return parseHex(value) ?? parseRgbFunction(value) ?? parseViaBrowser(value)
}

/** Reads a custom property off :root, e.g. tokenValue('--color-ink'). */
export function tokenValue(name: string): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (raw: number) => {
    const v = raw / 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(foreground: Rgb, background: Rgb): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * WCAG AA threshold. Large text is 24px, or 18.66px when bold — below that
 * the requirement is the full 4.5:1.
 */
export function requiredRatio(fontSizePx: number, bold = false): number {
  const isLarge = fontSizePx >= 24 || (bold && fontSizePx >= 18.66)
  return isLarge ? 3 : 4.5
}

export interface ContrastResult {
  ratio: number
  required: number
  passes: boolean
}

/** Resolves two token names to a pass/fail verdict at a given text size. */
export function measure(
  foregroundToken: string,
  backgroundToken: string,
  fontSizePx: number,
  bold = false,
): ContrastResult | null {
  const foreground = parseColor(tokenValue(foregroundToken))
  const background = parseColor(tokenValue(backgroundToken))
  if (!foreground || !background) return null

  const ratio = contrastRatio(foreground, background)
  const required = requiredRatio(fontSizePx, bold)
  return { ratio, required, passes: ratio >= required }
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`
}
