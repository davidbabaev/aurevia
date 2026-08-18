import { VEHICLES_PAGE } from '../data/copy'
import type { VehicleType } from '../data/vehicles'
import { CarShadow } from './CarShadow'

/**
 * Body style to silhouette file. Explicit, never interpolated: the data's
 * labels are 'Sedan', 'SUV' and 'Sports' and the files are lowercase, so
 * building the path from the label would give /images/bodystyle/SUV.webp.
 * Section 2 makes an explicit map the convention for exactly this reason, and
 * a new VehicleType now fails the build here instead of 404ing in a browser.
 *
 * The pipeline declares its slots as .png and ships .webp.
 */
const SILHOUETTES: Record<VehicleType, string> = {
  Sedan: '/images/bodystyle/sedan.webp',
  SUV: '/images/bodystyle/suv.webp',
  Sports: '/images/bodystyle/sports.webp',
}

interface BodyStyleTileProps {
  /** Body style as it appears in the data — Sedan, SUV, Sports. */
  label: VehicleType
  count: number
  selected?: boolean
  onSelect: () => void
}

/**
 * One tile in the body-style row. The mockup shows six invented styles with
 * invented counts; three exist in the data and the count is computed by the
 * caller (section 4).
 *
 * The tile used to borrow a real vehicle's front three-quarter cut-out. At
 * 64px tall a three-quarter view is a dark blob — the shape that tells a
 * saloon from an estate is the profile, so these are side-on silhouettes
 * belonging to the body style rather than to any one car in it. That also
 * stops the tile implying a particular vehicle is the category.
 *
 * Selected state is the accent tint the palette sanctions, with ink text on
 * it — never accent as the label colour, which is 2.41:1 on white.
 */
export function BodyStyleTile({
  label,
  count,
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
      <span className="relative block h-16 w-full">
        {/* Before the image and both positioned, so the car paints over the
            ellipse. Same device as VehicleCard, same component. */}
        <CarShadow size="tile" />
        <img
          src={SILHOUETTES[label]}
          alt=""
          loading="lazy"
          decoding="async"
          className="relative h-16 w-full object-contain"
        />
      </span>
      <span className="font-display text-body font-semibold text-ink">{label}</span>
      <span className="font-body text-body-sm text-muted">
        {VEHICLES_PAGE.bodyStyle.count(count)}
      </span>
    </button>
  )
}
