import { VEHICLE_DETAIL } from '../data/copy'
import { parseColor, relativeLuminance } from '../lib/contrast'

interface SwatchRowProps {
  colours: readonly string[]
  selected: number
  onSelect: (index: number) => void
}

/**
 * ── The one place in this codebase that writes a colour value by hand ──
 *
 * Section 4 says never a raw hex in a component, and everywhere else that
 * holds. These sixteen values are the documented exception, on the same
 * grounds as src/assets/logo-full.svg carrying its own #3A8EFC rather than a
 * palette token: they are ASSET colours, not UI colours. A manufacturer's
 * paint is a fact about the car, the way the logo blue is a fact about the
 * logo. Neither is a design decision this palette gets to make, and neither
 * changes when the palette changes.
 *
 * The previous version snapped every paint to the nearest of the nine UI
 * tokens, which was rule-abiding and useless: obsidian black, midnight
 * black, carbon black metallic and jet black metallic all resolved to `ink`
 * and rendered as four identical chips. A control that looks the same in
 * every state is not a control. Hence the map below.
 *
 * Do not "fix" these back to tokens. Adding a paint means adding a line here.
 *
 * The values are chosen for separation as much as for likeness: every pair
 * of paints that can appear in the same vehicle's row is at least 7.7 CIE76
 * ΔE apart, and no two of the sixteen are closer than 5.2. Nudge one and
 * check it still reads as a different chip from its neighbours.
 */
const PAINT: Record<string, string> = {
  // Whites — separated by cast, not by lightness, because there is barely
  // any lightness left to separate them with.
  'polar white': '#FEFEFC',
  'brilliant white': '#E9F1F9', // cool
  'mineral white': '#E9E1D0', // warm
  'glacier white': '#D6E3E1', // cool, faintly green

  silver: '#C0C6C9',

  // Greys, light to dark.
  'agate grey metallic': '#8E9291',
  'volcano grey metallic': '#75786C', // olive cast
  'daytona grey': '#56616B', // blue cast
  'matte graphite grey': '#4A4C4E',
  'graphite grey': '#383D41',

  // Blacks. Six of them, so the blue-cast ones lean into the blue and the
  // neutral ones are spaced out along lightness instead.
  'mythos black metallic': '#2B2C2E',
  'carbon black metallic': '#16283C', // blue
  'obsidian black metallic': '#1E211F',
  'midnight black': '#0A1630', // deep blue
  'jet black metallic': '#111316',
  'obsidian black': '#030304',
}

/**
 * An unmapped paint gets the `available` green — not a neutral, deliberately.
 * A missing paint that fell back to a grey would look like a plausible car
 * and ship unnoticed; a green chip in a row of blacks and whites cannot be
 * mistaken for anything but a gap in the map. The warning names the paint so
 * it is greppable without opening the page; it is behind import.meta.env.DEV,
 * which is a literal at build time, so the production render is pure and the
 * React Compiler sees no side effect to reason about.
 */
const UNMAPPED = 'var(--color-available)'
const warned = new Set<string>()

function paintValue(colour: string): string {
  const value = PAINT[colour.toLowerCase()]
  if (value) return value
  if (import.meta.env.DEV && !warned.has(colour)) {
    warned.add(colour)
    console.warn(`SwatchRow: no paint value for "${colour}" — [REPLACE] in PAINT.`)
  }
  return UNMAPPED
}

/**
 * A chip is a filled circle on a white card, so a near-white paint has no
 * edge of its own and needs one drawn. Section 4: a border that identifies a
 * control is muted, not the decorative border token.
 *
 * The cut is the point where the chip stops separating itself from the card —
 * 3:1 against white, which is relative luminance 0.30. Above it the chip is
 * pale and takes the muted edge; below it the fill already is the edge and
 * the rim is ink so it tightens rather than lightens. Derived from the value
 * rather than listed per paint, so it cannot drift out of step with the map.
 */
const PALE_LUMINANCE = 1.05 / 3 - 0.05

const EDGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAINT).map(([name, value]) => {
    const rgb = parseColor(value)
    const pale = rgb !== null && relativeLuminance(rgb) > PALE_LUMINANCE
    return [name, pale ? 'border-muted' : 'border-ink']
  }),
)

function edgeClass(colour: string): string {
  // The unmapped green sits mid-scale and reads fine against white; ink keeps
  // its rim consistent with every other dark chip.
  return EDGE[colour.toLowerCase()] ?? 'border-ink'
}

export function SwatchRow({ colours, selected, onSelect }: SwatchRowProps) {
  return (
    <div>
      <p className="font-body text-label text-muted uppercase">
        {VEHICLE_DETAIL.colourRow.label}
      </p>
      <ul className="mt-3 flex flex-wrap items-center gap-3">
        {colours.map((colour, index) => (
          <li key={colour}>
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-pressed={index === selected}
              // The chip carries no text, so the paint name is the entire
              // accessible name. Title gives the same thing to a mouse.
              aria-label={colour}
              title={colour}
              // The selection ring is ink, so it reads on white without
              // relying on accent, which cannot carry meaning on this ground.
              // ring-offset-2 is what keeps it visible on a black chip: the
              // ring never touches the fill, it sits 2px out on the white
              // card, where ink measures 20.6:1 even against obsidian black.
              className={[
                'block size-9 rounded-pill border transition-shadow',
                edgeClass(colour),
                index === selected ? 'ring-2 ring-ink ring-offset-2' : '',
              ].join(' ')}
              // The exempt value (see PAINT). Tailwind cannot build a class
              // from a runtime string and section 2 forbids interpolating one,
              // so the fill is applied as a style, not a utility.
              style={{ backgroundColor: paintValue(colour) }}
            />
          </li>
        ))}
      </ul>
      <p className="mt-3 font-body text-body-sm text-ink">{colours[selected]}</p>
    </div>
  )
}
