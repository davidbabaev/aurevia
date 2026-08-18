import { Link } from 'react-router'
import type { Vehicle } from '../data/vehicles'
import { CARD, VEHICLE_DETAIL } from '../data/copy'
import { Button } from './Button'
import { CarShadow } from './CarShadow'

interface VehicleCardProps {
  vehicle: Vehicle
  /**
   * The one tinted card in the wireframe's grid. Accent is listed in the
   * palette as a selected-card tint, so this is a fill, never coloured text.
   */
  highlight?: boolean
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/**
 * One vehicle, as it appears in every grid on the site — the home featured
 * band, the inventory grid and the similar-vehicles rail.
 *
 * The card is a single surface top to bottom. An earlier version gave the
 * image box the grey token and the body the white one, which split one card
 * into two stacked blocks; in the wireframe the grey is the SECTION behind
 * the card and the card itself is one uninterrupted light panel. The section
 * supplies the contrast, so the card needs no border either — a 1px hairline
 * shadow is all the separation it takes on both the white and the grey band.
 *
 * Metadata is muted on a white card, never on the surface band behind it:
 * muted reaches 4.49:1 on #F3F4F6 and fails by a hundredth (section 4).
 * Keeping the card white is what makes the label colour legal.
 */
export function VehicleCard({ vehicle, highlight = false }: VehicleCardProps) {
  const href = `/vehicles/${vehicle.slug}`

  return (
    <article
      className={[
        'group flex h-full flex-col overflow-hidden rounded-card p-5 shadow-xs shadow-ink/10',
        highlight ? 'bg-accent/10' : 'bg-bg',
      ].join(' ')}
    >
      {/* A fixed box, not one that follows the cut-out.
          The cut-outs are trimmed to their subject, so an SUV is a taller
          image than a coupe. Letting the box follow the file made every card
          in a row a different height and the prices stopped lining up across
          the grid. The box is fixed and the car is contained inside it. */}
      <div className="relative flex aspect-[16/9] items-center justify-center">
        {/* Before the image in the DOM and both are positioned, so the car
            paints over the ellipse rather than under it. A negative z-index
            would instead drop it behind the card's own fill. */}
        <CarShadow size="card" />
        <img
          src={`/images/vehicles/${vehicle.slug}/card.webp`}
          alt={vehicle.name}
          width={769}
          height={388}
          loading="lazy"
          decoding="async"
          className="relative max-h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      {/* No status pill in the image area. Every one of the twelve cars is
          New, so a badge on all twelve distinguishes nothing — it was noise
          sitting on top of the photograph. Condition still reaches the reader
          through the metadata line and the detail page. */}
      <div className="flex flex-1 flex-col gap-3 pt-5">
        <h3 className="font-display text-h3-sm text-ink">
          <Link to={href} className="hover:underline">
            {vehicle.name}
          </Link>
        </h3>

        {/* Mileage is deliberately absent: every car here is New, and section 4
            says mileage is not shown on a New vehicle.

            The tint changes the ground under this line, so it changes the
            colour too. Muted on the accent tint measures 4.55:1 over white and
            4.16:1 over the grey inventory band — the second fails AA outright
            and the first passes by half a hundredth, which is not a margin
            worth shipping. Tinted cards take ink and the question closes. */}
        <p className={`font-body text-body-sm ${highlight ? 'text-ink' : 'text-muted'}`}>
          {vehicle.year} · {vehicle.specs.fuel} · {vehicle.specs.transmission}
        </p>

        {/* No wrap. With it, whether the price and the button shared a line
            came down to a few pixels of label width, so one card in a row
            would stack while its neighbours did not. The button already
            refuses to wrap; the price is what gives. */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <p className="min-w-0 font-display text-h3-sm text-ink">
            {vehicle.price === null
              ? VEHICLE_DETAIL.contactForPrice
              : money.format(vehicle.price)}
          </p>
          <Button to={href} size="sm" variant="secondary" shape="control">
            {CARD.viewVehicle}
          </Button>
        </div>
      </div>
    </article>
  )
}
