import { VEHICLE_DETAIL } from '../data/copy'

interface SwatchRowProps {
  colours: readonly string[]
  selected: number
  onSelect: (index: number) => void
}

/**
 * Paint has to be shown as paint, and the palette holds nine tokens, none of
 * which is a car colour. Each swatch is therefore mapped to the token that
 * stands closest to it — never a raw hex (section 4). Tailwind only sees
 * complete class strings, so this is an explicit map rather than anything
 * built by interpolation.
 *
 * White gets a muted ring because a white chip on a white card would
 * otherwise have no edge at all.
 */
function chipClass(colour: string) {
  const name = colour.toLowerCase()
  if (name.includes('white')) return 'bg-bg border-muted'
  if (name.includes('silver')) return 'bg-sold border-sold'
  if (name.includes('grey') || name.includes('gray')) return 'bg-graphite border-graphite'
  return 'bg-ink border-ink'
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
              aria-label={colour}
              title={colour}
              // The selection ring is ink, so it reads on white without
              // relying on accent, which cannot carry meaning on this ground.
              className={[
                'block size-9 rounded-pill border transition-shadow',
                chipClass(colour),
                index === selected ? 'ring-2 ring-ink ring-offset-2' : '',
              ].join(' ')}
            />
          </li>
        ))}
      </ul>
      <p className="mt-3 font-body text-body-sm text-ink">{colours[selected]}</p>
    </div>
  )
}
