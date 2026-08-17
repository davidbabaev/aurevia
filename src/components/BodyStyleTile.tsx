import { VEHICLES_PAGE } from '../data/copy'

interface BodyStyleTileProps {
  /** Body style as it appears in the data — Sedan, SUV, Sports. */
  label: string
  count: number
  /** A vehicle of this type, used for the tile's silhouette. */
  imageSlug: string
  selected?: boolean
  onSelect: () => void
}

/**
 * One tile in the body-style row. The mockup shows six invented styles with
 * invented counts; three exist in the data and the count is computed by the
 * caller (section 4).
 *
 * Selected state is the accent tint the palette sanctions, with ink text on
 * it — never accent as the label colour, which is 2.41:1 on white.
 */
export function BodyStyleTile({
  label,
  count,
  imageSlug,
  selected = false,
  onSelect,
}: BodyStyleTileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        'flex w-full flex-col items-center gap-2 rounded-card border p-4 text-center transition-colors',
        selected ? 'border-accent bg-accent/10' : 'border-border bg-bg hover:border-muted',
      ].join(' ')}
    >
      <img
        src={`/images/vehicles/${imageSlug}/card.webp`}
        alt=""
        width={769}
        height={388}
        loading="lazy"
        decoding="async"
        className="h-16 w-full object-contain"
      />
      <span className="font-display text-body font-semibold text-ink">{label}</span>
      <span className="font-body text-body-sm text-muted">
        {VEHICLES_PAGE.bodyStyle.count(count)}
      </span>
    </button>
  )
}
