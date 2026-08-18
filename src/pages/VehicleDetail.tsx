import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '../components/Button'
import { CarShadow } from '../components/CarShadow'
import { Container } from '../components/Container'
import { Gallery } from '../components/Gallery'
import { Icon } from '../components/Icon'
import { Section } from '../components/Section'
import { ShowroomCta } from '../components/ShowroomCta'
import { SpecTable } from '../components/SpecTable'
import { StatusPill } from '../components/StatusPill'
import { SwatchRow } from '../components/SwatchRow'
import { swatchImage } from '../lib/vehicleImages'
import { VehicleCard } from '../components/VehicleCard'
import { NOT_FOUND, PAGINATION, VEHICLE_DETAIL } from '../data/copy'
import { VEHICLES, type Vehicle } from '../data/vehicles'

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/**
 * Anchor targets for the tab row, in the same order as VEHICLE_DETAIL.tabs.
 * The mockup's fifth tab is Reviews; no review data exists and none may be
 * invented (section 5), so copy.ts omits it and so does this.
 */
const TAB_IDS = ['overview', 'features', 'specifications', 'gallery'] as const

/**
 * The gallery strip. Six shots fill the component's six-column thumbnail
 * row exactly as the wireframe shows it.
 *
 * `architecture` is the seventh the manifest generates and it is in none of
 * them. It carried the hero while the hero was a photograph; the hero is a
 * studio stage now, so the slot is still generated and shipped but this page
 * no longer reads it. Left in the manifest rather than removed — dropping it
 * would strand a raw that has already been paid for, and a seventh thumbnail
 * would break the six-column row.
 */
const GALLERY_SHOTS = [
  { key: 'exterior', label: VEHICLE_DETAIL.gallery.exterior },
  { key: 'interior', label: VEHICLE_DETAIL.gallery.interior },
  { key: 'dashboard', label: VEHICLE_DETAIL.gallery.dashboard },
  { key: 'detail', label: VEHICLE_DETAIL.gallery.detail },
  { key: 'detail-2', label: VEHICLE_DETAIL.gallery['detail-2'] },
  { key: 'road', label: VEHICLE_DETAIL.gallery.road },
] as const

/**
 * The similar-vehicles rail.
 *
 * A carousel rather than a grid, and the scroll belongs to this element
 * rather than the document — a rail that widened the page would break the
 * 320-to-1920 no-horizontal-scroll rule on every route that used it.
 *
 * Keyboard: the scroller itself is focusable and carries a name, so arrow
 * keys drive it directly; tabbing into a card link scrolls that card into
 * view natively. The two buttons are the pointer affordance on top of that,
 * and they go disabled at each end — which is also their resting state when
 * every card already fits, so a control is never offered that does nothing.
 *
 * It lives in this file rather than in components/ because nothing else on
 * the site shows a rail; the moment a second caller wants one it should move.
 */
function SimilarRail({ vehicles }: { vehicles: readonly Vehicle[] }) {
  const railRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ atStart: true, atEnd: true })

  useEffect(() => {
    const rail = railRef.current
    const list = listRef.current
    if (!rail || !list) return

    const update = () => {
      // A one-pixel tolerance: fractional layout widths mean scrollLeft
      // rarely lands exactly on the maximum.
      const max = rail.scrollWidth - rail.clientWidth
      setEdges({ atStart: rail.scrollLeft <= 1, atEnd: rail.scrollLeft >= max - 1 })
    }

    update()
    rail.addEventListener('scroll', update, { passive: true })

    // The rail resizes with the viewport; the list resizes when the vehicle
    // changes and a different number of cards is in it. Both change whether
    // there is anything left to scroll to.
    const observer = new ResizeObserver(update)
    observer.observe(rail)
    observer.observe(list)

    return () => {
      rail.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  const step = (direction: 1 | -1) => {
    const rail = railRef.current
    if (!rail) return
    // Just under a full view, so the card at the edge stays on screen and
    // the reader keeps their place.
    rail.scrollBy({ left: direction * rail.clientWidth * 0.9, behavior: 'smooth' })
  }

  // Same shape as the pagination control: a bordered square on white, with
  // the one arrow glyph in the set turned round for the backwards direction.
  const control =
    'flex size-11 items-center justify-center rounded-control border border-muted ' +
    'bg-bg text-ink disabled:cursor-not-allowed disabled:border-sold disabled:bg-sold'

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-h2-sm text-ink lg:text-h2">
          {VEHICLE_DETAIL.sections.similar}
        </h2>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={edges.atStart}
            aria-label={PAGINATION.previous}
            className={control}
          >
            <span className="rotate-180">
              <Icon name="arrow-right" size={18} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={edges.atEnd}
            aria-label={PAGINATION.next}
            className={control}
          >
            <Icon name="arrow-right" size={18} />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        tabIndex={0}
        role="group"
        aria-label={VEHICLE_DETAIL.sections.similar}
        className="mt-8 overflow-x-auto pb-3"
      >
        <ul ref={listRef} className="flex snap-x snap-mandatory gap-6">
          {vehicles.map((entry, index) => (
            <li key={entry.slug} className="w-[280px] shrink-0 snap-start sm:w-[320px]">
              <VehicleCard vehicle={entry} highlight={index === 0} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

/** One template serving every vehicle in the local content files. */
export function VehicleDetail() {
  const { slug } = useParams()
  const vehicle = VEHICLES.find((entry) => entry.slug === slug)

  /**
   * The swatch the colour section is showing. Held here rather than inside
   * SwatchRow because it drives the photograph, not just the chip ring.
   *
   * The slug is stored with it because react-router keeps this component
   * mounted across a param change: pairing the two lets the selection fall
   * back to the photographed paint when the car changes, with no effect and
   * no second render.
   */
  const [paint, setPaint] = useState({ slug, index: 0 })
  const selectColour = (index: number) => setPaint({ slug, index })

  if (!vehicle) {
    return (
      <Section tone="white" spacing="none" width="narrow">
        <div className="pt-nav-clear pb-section-sm">
          <h1 className="font-display text-display-sm text-ink lg:text-display">
            {NOT_FOUND.heading}
          </h1>
          <p className="mt-6 font-body text-body-lg text-muted">{NOT_FOUND.body}</p>
          <div className="mt-8">
            <Button to="/vehicles">{NOT_FOUND.cta}</Button>
          </div>
        </div>
      </Section>
    )
  }

  const { specs, features } = vehicle
  const selected =
    paint.slug === slug && paint.index < vehicle.colours.length ? paint.index : 0
  const paintImage = swatchImage(vehicle.slug, vehicle.colours[selected], selected)

  const priceLabel =
    vehicle.price === null ? VEHICLE_DETAIL.contactForPrice : money.format(vehicle.price)

  // The label already reads "0–60 mph", so the sentence form of the value is
  // trimmed down to the figure itself for the strip.
  const zeroToSixty = specs.acceleration.replace(/^0–60 mph in\s*/, '')

  const quickSpecs = [
    { label: VEHICLE_DETAIL.quickSpecs.acceleration, value: zeroToSixty },
    { label: VEHICLE_DETAIL.quickSpecs.topSpeed, value: specs.topSpeed },
    { label: VEHICLE_DETAIL.quickSpecs.power, value: specs.power },
    { label: VEHICLE_DETAIL.quickSpecs.drivetrain, value: specs.drivetrain },
  ]

  // One headline item from each equipment group — real content, never a
  // written-for-the-layout bullet.
  const highlights = [
    features.safety[0],
    features.comfort[0],
    features.technology[0],
    features.exterior[0],
  ]

  const featureGroups = [
    { heading: VEHICLE_DETAIL.featureGroups.safety, items: features.safety },
    { heading: VEHICLE_DETAIL.featureGroups.comfort, items: features.comfort },
    { heading: VEHICLE_DETAIL.featureGroups.technology, items: features.technology },
    { heading: VEHICLE_DETAIL.featureGroups.exterior, items: features.exterior },
  ]

  const performanceRows = [
    { label: VEHICLE_DETAIL.specLabels.engine, value: specs.engine },
    { label: VEHICLE_DETAIL.specLabels.power, value: specs.power },
    { label: VEHICLE_DETAIL.specLabels.transmission, value: specs.transmission },
    { label: VEHICLE_DETAIL.specLabels.drivetrain, value: specs.drivetrain },
  ]

  const specGroups = [
    {
      heading: VEHICLE_DETAIL.specGroups.performance,
      rows: [
        { label: VEHICLE_DETAIL.specLabels.engine, value: specs.engine },
        { label: VEHICLE_DETAIL.specLabels.power, value: specs.power },
        { label: VEHICLE_DETAIL.specLabels.acceleration, value: zeroToSixty },
        { label: VEHICLE_DETAIL.specLabels.topSpeed, value: specs.topSpeed },
      ],
    },
    {
      heading: VEHICLE_DETAIL.specGroups.vehicle,
      rows: [
        { label: VEHICLE_DETAIL.specLabels.bodyStyle, value: vehicle.type },
        { label: VEHICLE_DETAIL.specLabels.transmission, value: specs.transmission },
        { label: VEHICLE_DETAIL.specLabels.drivetrain, value: specs.drivetrain },
        { label: VEHICLE_DETAIL.specLabels.fuel, value: specs.fuel },
        { label: VEHICLE_DETAIL.specLabels.seats, value: String(specs.seats) },
        { label: VEHICLE_DETAIL.specLabels.doors, value: String(specs.doors) },
      ],
    },
    {
      heading: VEHICLE_DETAIL.specGroups.details,
      rows: [
        { label: VEHICLE_DETAIL.specLabels.year, value: String(vehicle.year) },
        { label: VEHICLE_DETAIL.specLabels.condition, value: vehicle.condition },
        { label: VEHICLE_DETAIL.specLabels.exteriorColour, value: specs.exteriorColour },
        { label: VEHICLE_DETAIL.specLabels.interiorColour, value: specs.interiorColour },
        { label: VEHICLE_DETAIL.specLabels.stockNumber, value: vehicle.stockNumber },
      ],
    },
  ]

  // Same body style first, then the rest of the manufacturer's range. Both
  // lists come from the real inventory; nothing is invented to fill the rail,
  // and the cap is above what the inventory can supply so the rail shows
  // everything genuinely related rather than a rounded-down four.
  const similar = [
    ...VEHICLES.filter((entry) => entry.slug !== vehicle.slug && entry.type === vehicle.type),
    ...VEHICLES.filter(
      (entry) =>
        entry.slug !== vehicle.slug &&
        entry.type !== vehicle.type &&
        entry.brand === vehicle.brand,
    ),
  ].slice(0, 6)

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────
          A studio stage, not a photograph. The band this replaces put
          architecture.webp full-bleed under a white fade, and the fade was
          the tell: it washed the front half of the car out to make room for
          the copy, the frame cropped the car at the right edge, and an
          environmental shot sets the car back behind the building anyway —
          three symptoms of one mistake, which is asking a scene to be a
          portrait. The wireframe does not use a scene. It stands the car on
          a soft light ground and lets it be the subject.

          So the ground is a gradient in the tokens rather than a picture,
          and the car is card.webp — the same keyed cut-out every grid on the
          site uses, whole and with air around it. Nothing overlaps it: the
          copy has its own column on bg, which is why no scrim is needed here
          and none is used. That retires one of the two gradients section 4
          was carrying; the ellipse under the car and this ground are what
          remain, and this one is flat token-to-token rather than a scrim
          over artwork.

          Two real layouts. From 1024px the ground bleeds to the right edge
          behind a two-column grid; below that the car takes its own panel in
          the flow, above the copy, the way the cards do. */}
      <section className="relative overflow-hidden bg-bg">
        {/* The ground. It bleeds to the viewport edge as the wireframe has
            it, so the stage belongs to the page instead of sitting on it as
            a card. surface against bg across the seam is 1.05:1 — far too
            close to read as an edge, which is the whole reason the left
            column needs no fade to protect it. */}
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 hidden w-[56%] bg-linear-to-b from-surface to-bg lg:block"
        />

        <Container>
          <div className="relative pt-nav-clear pb-section-tight lg:min-h-[600px] lg:pb-[128px]">
            <ol className="flex flex-wrap items-center gap-2 font-body text-body-sm text-ink">
              <li>
                <Link to="/" className="hover:underline">
                  {VEHICLE_DETAIL.breadcrumb.home}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to="/vehicles" className="hover:underline">
                  {VEHICLE_DETAIL.breadcrumb.vehicles}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold">
                {vehicle.name}
              </li>
            </ol>

            <div className="mt-6 lg:mt-10 lg:grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-center lg:gap-10">
              {/* The stage. First in source so the small layout keeps the
                  breadcrumb → car → copy order the page already had, and
                  sent to the second column from 1024px.

                  Below 1024 it carries the ground itself as a rounded panel,
                  because the bleeding one behind it is desktop-only; from
                  1024 the panel drops its own fill and stands on that.

                  object-contain object-bottom, not centred: the twelve
                  cut-outs run 1.80 to 2.26 in aspect, and centring one in a
                  fixed box floats the wheels a different distance off the
                  bottom for every car, which is exactly the thing a contact
                  shadow cannot tolerate. Bottom-aligning pins all twelve to
                  the same place. See CarShadow. */}
              <div className="rounded-card bg-linear-to-b from-surface to-bg px-5 py-7 lg:order-last lg:rounded-none lg:bg-none lg:px-0 lg:py-0">
                <div className="relative mx-auto aspect-[2/1] w-full max-w-[680px]">
                  <CarShadow size="hero" />
                  <img
                    src={`/images/vehicles/${vehicle.slug}/card.webp`}
                    alt={vehicle.name}
                    width={812}
                    height={406}
                    fetchPriority="high"
                    decoding="async"
                    className="relative size-full object-contain object-bottom"
                  />
                </div>
              </div>

              <div className="mt-8 lg:mt-0">
              <p className="font-body text-label text-ink uppercase">{vehicle.year}</p>

              <h1 className="mt-3 font-display text-display-sm text-ink lg:text-display">
                {vehicle.name}
              </h1>

              <p className="mt-4 font-display text-h3-sm text-ink lg:text-h3">{vehicle.trim}</p>

              <p className="mt-3 font-body text-body-sm text-ink">
                {vehicle.brand} · {vehicle.type} · {specs.fuel}
              </p>

              <p className="mt-8 font-display text-h2-sm text-ink lg:text-h2">{priceLabel}</p>
              {vehicle.price !== null && (
                <p className="mt-1 font-body text-body-sm text-ink">
                  {VEHICLE_DETAIL.startingPrice}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Button to="/book-a-meeting">{VEHICLE_DETAIL.primaryCta}</Button>
                <Button to="/contact" variant="secondary">
                  {VEHICLE_DETAIL.secondaryCtas.enquire}
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <StatusPill status={vehicle.available ? 'available' : 'sold'} />
                <p className="font-body text-body-sm text-ink">
                  {VEHICLE_DETAIL.stockLabel} {vehicle.stockNumber}
                </p>
              </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Quick specs and the tab row ──────────────────────────────
          The strip is a white card pulled up over the bottom edge of the
          hero photograph, the same overlap device the search card uses on
          Home. Below 1024px it simply follows the hero.

          It carries the four performance figures and nothing else; the
          colour picker used to share it, but a swatch that changes a
          photograph needs the photograph next to it, which a strip has no
          room for. */}
      <Section tone="white" spacing="tight">
        <div className="relative z-10 rounded-card border border-border bg-bg p-5 lg:-mt-24 lg:p-7">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
            {quickSpecs.map((spec) => (
              // Reversed in flow so the figure reads above its label while
              // the markup keeps dt before dd.
              <div key={spec.label} className="flex flex-col-reverse">
                <dt className="mt-1 font-body text-body-sm text-muted">{spec.label}</dt>
                <dd className="font-display text-h3-sm text-ink">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <ul className="mt-10 flex gap-8 overflow-x-auto border-b border-border">
          {VEHICLE_DETAIL.tabs.map((tab, index) => (
            <li key={tab} className="shrink-0">
              <a
                href={`#${TAB_IDS[index]}`}
                className="inline-block border-b-2 border-bg pb-3 font-display text-body-sm font-semibold text-ink transition-colors hover:border-ink"
              >
                {tab}
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Overview ─────────────────────────────────────────────── */}
      <Section tone="white">
        <div id="overview" className="scroll-mt-32">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <h2 className="font-display text-h2-sm text-ink lg:text-h2">
                {VEHICLE_DETAIL.sections.description}
              </h2>

              <p className="mt-6 font-body text-body-lg-sm text-muted lg:text-body-lg">
                {vehicle.description}
              </p>

              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-ink">
                      <Icon name="check" size={20} />
                    </span>
                    <span className="font-body text-body-sm text-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-card border border-border bg-surface">
              <img
                src={`/images/vehicles/${vehicle.slug}/dashboard.webp`}
                alt={`${vehicle.name} — ${VEHICLE_DETAIL.gallery.dashboard}`}
                width={1344}
                height={1008}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Performance ──────────────────────────────────────────────
          The obsidian band in the page rhythm. Accent is legal as type here
          and nowhere lighter; secondary type is border, not muted. */}
      <Section tone="ink">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="overflow-hidden rounded-card">
            <img
              src={`/images/vehicles/${vehicle.slug}/road.webp`}
              alt={`${vehicle.name} — ${VEHICLE_DETAIL.gallery.road}`}
              width={1344}
              height={1008}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div>
            <p className="font-body text-label text-accent uppercase">{vehicle.brand}</p>

            <h2 className="mt-3 font-display text-h2-sm text-bg lg:text-h2">
              {VEHICLE_DETAIL.specGroups.performance}
            </h2>

            <dl className="mt-8 divide-y divide-graphite">
              {performanceRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-6 py-4"
                >
                  <dt className="font-body text-body-sm text-border">{row.label}</dt>
                  <dd className="text-right font-body text-body-sm font-semibold text-bg">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* ── Exterior colour ──────────────────────────────────────────
          The swatch row moved out of the spec strip and got the thing it
          was always missing: the car it changes, at a size worth looking
          at. Selecting a chip swaps the cut-out and nothing else.

          The section is grey and the content is a white card, because
          SwatchRow labels its chips in muted and muted on #F3F4F6 is
          4.49:1 — it fails by a hundredth (section 4). The card is what
          makes the component legal here, which is also why the component
          is wrapped rather than altered.

          No heading: SwatchRow prints "Exterior colour" itself, so the
          section is named for assistive technology and left alone
          visually rather than saying it twice. */}
      <Section tone="surface" label={VEHICLE_DETAIL.colourRow.label}>
        <div className="grid gap-7 rounded-card border border-border bg-bg p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,240px)] lg:items-center lg:gap-12 lg:p-8">
          {/* The cut-outs are trimmed to the car and have no ground of
              their own, so they get the grey one every other cut-out on
              the site sits on. */}
          <div className="flex items-center justify-center rounded-card bg-surface px-4 py-6 lg:px-8 lg:py-10">
            <img
              src={paintImage}
              alt={`${vehicle.name} — ${vehicle.colours[selected]}`}
              width={769}
              height={388}
              loading="lazy"
              decoding="async"
              className="h-auto w-full object-contain"
            />
          </div>

          <SwatchRow colours={vehicle.colours} selected={selected} onSelect={selectColour} />
        </div>
      </Section>

      {/* ── Features and gallery ─────────────────────────────────────
          One white band carrying both blocks, so the page does not put two
          separate white sections back to back. */}
      <Section tone="white">
        <div id="features" className="scroll-mt-32">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden rounded-card border border-border bg-surface lg:order-last">
              <img
                src={`/images/vehicles/${vehicle.slug}/interior.webp`}
                alt={`${vehicle.name} — ${VEHICLE_DETAIL.gallery.interior}`}
                width={1344}
                height={1008}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            <div>
              <h2 className="font-display text-h2-sm text-ink lg:text-h2">
                {VEHICLE_DETAIL.sections.features}
              </h2>

              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                {featureGroups.map((group) => (
                  <section key={group.heading}>
                    <h3 className="font-display text-h3-sm text-ink">{group.heading}</h3>
                    <ul className="mt-3 space-y-2">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-0.5 shrink-0 text-ink">
                            <Icon name="check" size={16} />
                          </span>
                          <span className="font-body text-body-sm text-muted">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div id="gallery" className="mt-section-sm scroll-mt-32 lg:mt-section">
          <h2 className="font-display text-h2-sm text-ink lg:text-h2">
            {VEHICLE_DETAIL.sections.gallery}
          </h2>
          <div className="mt-8">
            <Gallery
              vehicleSlug={vehicle.slug}
              vehicleName={vehicle.name}
              shots={GALLERY_SHOTS}
            />
          </div>
        </div>
      </Section>

      {/* ── Specifications ───────────────────────────────────────── */}
      <Section tone="surface">
        <div id="specifications" className="scroll-mt-32">
          <h2 className="font-display text-h2-sm text-ink lg:text-h2">
            {VEHICLE_DETAIL.sections.specs}
          </h2>
          <div className="mt-8">
            <SpecTable groups={specGroups} />
          </div>
        </div>
      </Section>

      {/* ── Similar vehicles ─────────────────────────────────────────
          Ahead of the booking banner, not behind it: the reader who is not
          convinced by this car should meet the alternatives before the page
          asks them to commit to a visit. */}
      <Section tone="white">
        <SimilarRail vehicles={similar} />
      </Section>

      {/* ── Book a viewing ───────────────────────────────────────────
          The closing band, as it is on Home and Vehicles. */}
      <Section tone="surface">
        <ShowroomCta />
      </Section>
    </>
  )
}
