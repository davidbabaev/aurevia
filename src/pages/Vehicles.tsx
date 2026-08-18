import { useState } from 'react'
import { BodyStyleTile } from '../components/BodyStyleTile'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { FilterBar } from '../components/FilterBar'
import { EMPTY_FILTERS, type FilterState } from '../lib/filters'
import { Icon } from '../components/Icon'
import { Pagination } from '../components/Pagination'
import { Section } from '../components/Section'
import { ShowroomCta } from '../components/ShowroomCta'
import { ValueBand } from '../components/ValueBand'
import { VehicleCard } from '../components/VehicleCard'
import { VEHICLES_PAGE } from '../data/copy'
import { VEHICLES, type Vehicle } from '../data/vehicles'

/*
 * The inventory page, built to docs/reference/vehicles-desktop.png.
 *
 * Two things in that mockup are drawn from an inventory that does not exist
 * and are therefore computed here instead of copied (section 4):
 *  - six body styles with invented counts. Three types exist in the data and
 *    each tile's count is counted.
 *  - eight pages of results. Twelve cars at a page size of twelve is one page,
 *    so <Pagination /> returns null. That is the correct state, not a bug.
 * The mockup's "Want to buy or sell a vehicle?" block is not built: Aurevia
 * does not take listings from the public, so the page runs from the grid
 * straight into the value band.
 */

const PAGE_SIZE = 12
const PRICE_STEP = 50_000

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

// Every option list below is derived from the content file, so a car added
// there widens the filters without anyone touching this page.
const BRAND_OPTIONS = unique(VEHICLES.map((v) => v.brand))
const TYPE_OPTIONS = unique(VEHICLES.map((v) => v.type))
const FUEL_OPTIONS = unique(VEHICLES.map((v) => v.specs.fuel))
const YEAR_OPTIONS = unique(VEHICLES.map((v) => v.year))
  .sort((a, b) => b - a)
  .map(String)

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/**
 * Price bands are banded, not enumerated, and their labels are formatted
 * numbers rather than invented English — copy.ts carries no band wording and
 * section 5 forbids making some up. The top band runs to infinity so the most
 * expensive car cannot fall off its own upper edge.
 */
const PRICED = VEHICLES.map((v) => v.price).filter((p): p is number => p !== null)
const PRICE_FLOOR = Math.floor(Math.min(...PRICED) / PRICE_STEP) * PRICE_STEP
const PRICE_CEILING = Math.ceil(Math.max(...PRICED) / PRICE_STEP) * PRICE_STEP
const BAND_COUNT = Math.max(1, (PRICE_CEILING - PRICE_FLOOR) / PRICE_STEP)

const PRICE_BANDS = Array.from({ length: BAND_COUNT }, (_, index) => {
  const from = PRICE_FLOOR + index * PRICE_STEP
  const to = from + PRICE_STEP
  return {
    label: `${money.format(from)} – ${money.format(to)}`,
    from,
    to: index === BAND_COUNT - 1 ? Number.POSITIVE_INFINITY : to,
  }
})
const PRICE_OPTIONS = PRICE_BANDS.map((band) => band.label)

// One tile per body style actually present, with a counted, never hardcoded,
// count. The tile owns its own silhouette now — it is keyed to the body style
// itself rather than borrowed from whichever car of that type happened to be
// first in the file, so this no longer picks one.
const BODY_STYLES = TYPE_OPTIONS.map((type) => ({
  label: type,
  count: VEHICLES.filter((v) => v.type === type).length,
}))

const TABS = VEHICLES_PAGE.available.tabs
const SORTS = VEHICLES_PAGE.sort.options

/** One car has no price. It sorts to the end rather than to zero. */
function byPrice(a: Vehicle, b: Vehicle, direction: 1 | -1) {
  if (a.price === null) return b.price === null ? 0 : 1
  if (b.price === null) return -1
  return (a.price - b.price) * direction
}

export function Vehicles() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [tab, setTab] = useState(0)
  const [sort, setSort] = useState(0)
  const [page, setPage] = useState(1)

  // Any change to what is being shown returns to the first page, otherwise a
  // narrowing filter can strand the reader on a page that no longer exists.
  function changeFilters(next: FilterState) {
    setFilters(next)
    setPage(1)
  }

  function reset() {
    setFilters(EMPTY_FILTERS)
    setTab(0)
    setPage(1)
  }

  function selectBodyStyle(label: string) {
    changeFilters({ ...filters, type: filters.type === label ? '' : label })
  }

  const keyword = filters.keyword.trim().toLowerCase()
  const band = PRICE_BANDS.find((b) => b.label === filters.price)

  const matched = VEHICLES.filter((vehicle) => {
    if (tab === 1 && vehicle.condition !== 'New') return false
    if (tab === 2 && !vehicle.featured) return false
    if (filters.brand && vehicle.brand !== filters.brand) return false
    if (filters.type && vehicle.type !== filters.type) return false
    if (filters.fuel && vehicle.specs.fuel !== filters.fuel) return false
    if (filters.year && String(vehicle.year) !== filters.year) return false

    if (band) {
      // A car with no price cannot sit inside a price band, and asking is not
      // an error — it simply drops out while the band is set.
      if (vehicle.price === null) return false
      if (vehicle.price < band.from || vehicle.price >= band.to) return false
    }

    if (keyword) {
      const haystack = [
        vehicle.name,
        vehicle.brand,
        vehicle.model,
        vehicle.trim,
        vehicle.type,
        vehicle.specs.fuel,
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(keyword)) return false
    }

    return true
  })

  const sorted = [...matched].sort((a, b) => {
    if (sort === 1) return byPrice(a, b, 1)
    if (sort === 2) return byPrice(a, b, -1)
    if (sort === 3) return b.year - a.year
    // "Newest first" keeps the order the content file lists, which is the
    // order the showroom took the cars in.
    return 0
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const visible = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────
          A photograph shot for this band: a dark saloon in the right half on
          a pale plaza, the left half open ground. It used to borrow
          home-hero.webp, which is a near-black showroom — two pages one click
          apart opening on the same frame, and a dark ground that forced white
          type. This one is bright overcast daylight, so the band is white and
          every piece of type on it is ink. White measures 1.4:1 on this
          photograph and the border token barely more, so the eyebrow, the
          support line and the secondary button all changed colour with it.

          Three things keep ink legal here, and each one was measured on the
          rendered page against the real glyph pixels — the background under
          the ink itself, not the line box, which is far wider than the type
          and charges it for ground no glyph ever touches.

          One: the copy column is capped at 420px rather than 576px, the same
          measure the detail heroes use. Two: the block is pinned to the
          bottom of the band, which is also where the wireframe puts it — its
          buttons finish 104px above the image edge. That matters because a
          strip of distant skyline runs across the middle of the frame at
          about 53% of its height and drops ink to 2.9:1; bottom-pinning drops
          the whole column clear of it at every width from 1024 to 1600.
          Three: a flat 25% white veil from 1600px only. Past about 1600 the
          centred 1200px measure has pushed the copy far enough right that the
          skyline runs under it whatever the vertical alignment, and no
          arrangement of this copy inside a 536px band clears it — the block
          would need a band nearer 780px tall to sit wholly above or below the
          strip. The veil is flat rather than a gradient, and Home already
          carries one on its own hero.

          It is deliberately NOT on at 1024–1599, where bottom-pinning alone
          already gives zero failing glyph pixels. A white overlay is exactly
          what washed the car out of the detail hero and got that band
          rebuilt; running it at every width to solve a problem that only
          exists above 1600 would spend the photograph to buy nothing. Scoped
          this way the frame is clean at every width anyone reviews it at, and
          the veil only appears where the arithmetic leaves no alternative.

          Two real layouts, one img and one fetch. From 1024px the photograph
          fills the band and the copy lies over its left half at the height
          the wireframe draws — 536px, where the band used to run about 480.
          Below that the same file is a 16:9 block in the flow with the copy
          beneath it on white: at 390px there is no left half to sit on, the
          veil is off, and ink on white measures 19.8:1. */}
      <section className="relative overflow-hidden bg-bg pt-nav-clear lg:pt-0">
        <img
          src="/images/hero/vehicles-hero.webp"
          alt=""
          width={1344}
          height={768}
          fetchPriority="high"
          decoding="async"
          className="aspect-video w-full object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:size-full"
        />
        <div aria-hidden className="absolute inset-0 hidden bg-bg/25 min-[1600px]:block" />

        <Container>
          <div className="relative pt-8 pb-section-tight lg:flex lg:min-h-[536px] lg:flex-col lg:justify-end lg:pt-nav-clear lg:pb-[104px]">
            <div className="max-w-xl lg:max-w-[420px]">
              <p className="font-body text-label text-ink uppercase">
                {VEHICLES_PAGE.eyebrow}
              </p>
              <h1 className="mt-4 font-display text-display-sm text-ink lg:text-display">
                {VEHICLES_PAGE.heading}
              </h1>
              <p className="mt-5 font-body text-body-lg-sm text-ink lg:text-body-lg">
                {VEHICLES_PAGE.support}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="#available">
                  {VEHICLES_PAGE.primaryCta}
                  <Icon name="arrow-right" size={18} />
                </Button>
                <Button to="/book-a-meeting" variant="secondary">
                  {VEHICLES_PAGE.secondaryCta}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Filters ──────────────────────────────────────────────────────
          The card laps the bottom of the hero the way the wireframe draws it
          — 44px of a 139px card in the reference, which is close to the third
          the negative margin leaves here once the wrapper padding is paid.
          The padding on the wrapper is what stops the negative margin
          collapsing through and dragging the white band up with it.

          The lap starts at 1024px rather than 768px now: below that the
          photograph is a block in the flow with the copy under it, so there
          is no image edge left to lap — the card would have pulled up over
          the hero's own buttons instead. */}
      <div className="bg-bg pt-section-tight">
        <div className="relative z-10 lg:-mt-[104px]">
          <Container>
            <FilterBar
              value={filters}
              onChange={changeFilters}
              onReset={reset}
              brands={BRAND_OPTIONS}
              types={TYPE_OPTIONS}
              fuels={FUEL_OPTIONS}
              prices={PRICE_OPTIONS}
              years={YEAR_OPTIONS}
            />
          </Container>
        </div>
      </div>

      {/* ── Browse by body style ─────────────────────────────────────── */}
      <Section tone="white">
        <h2 className="font-display text-h2-sm text-ink lg:text-h2">
          {VEHICLES_PAGE.bodyStyle.heading}
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {BODY_STYLES.map((style) => (
            <li key={style.label}>
              <BodyStyleTile
                label={style.label}
                count={style.count}
                selected={filters.type === style.label}
                onSelect={() => selectBodyStyle(style.label)}
              />
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Available vehicles ───────────────────────────────────────────
          The band is white, not grey. The wireframe runs one uninterrupted
          white page from under the hero all the way to the footer and carries
          the white / light-grey / obsidian rhythm in inset panels instead —
          grey body-style tiles, grey vehicle cards, the grey value band, the
          obsidian showroom card. A grey band here read as a second ground
          behind cards that already have one.

          It also settles the contrast question rather than working around it:
          muted on #F3F4F6 is 4.49:1 and fails by a hundredth (section 4), so
          on the old grey band nothing secondary could touch the band itself.
          On white, muted is 4.94:1 and legal everywhere in this section. */}
      <Section tone="white" id="available">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-h2-sm text-ink lg:text-h2">
            {VEHICLES_PAGE.available.heading}
          </h2>
          <p aria-live="polite" className="font-body text-body-sm text-ink">
            {VEHICLES_PAGE.resultCount(sorted.length)}
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Toggle buttons rather than ARIA tabs: there is no tabpanel here,
              the row narrows one list in place. */}
          <div
            role="group"
            aria-label={VEHICLES_PAGE.available.heading}
            className="flex flex-wrap gap-2"
          >
            {TABS.map((label, index) => (
              <button
                key={label}
                type="button"
                aria-pressed={tab === index}
                onClick={() => {
                  setTab(index)
                  setPage(1)
                }}
                className={[
                  'rounded-pill border px-5 py-2 font-body text-body-sm font-semibold text-ink',
                  'transition-colors',
                  tab === index
                    ? 'border-accent bg-accent'
                    : 'border-muted bg-bg hover:border-ink',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3">
            <span className="shrink-0 font-body text-body-sm font-semibold text-ink">
              {VEHICLES_PAGE.sort.label}
            </span>
            <span className="relative block min-w-0 flex-1 lg:w-56 lg:flex-none">
              <select
                name="sort"
                value={sort}
                onChange={(event) => {
                  setSort(Number(event.target.value))
                  setPage(1)
                }}
                className="h-11 w-full appearance-none rounded-control border border-muted bg-bg pr-11 pl-4 font-body text-body-sm text-ink"
              >
                {SORTS.map((option, index) => (
                  <option key={option} value={index}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink">
                <Icon name="chevron-down" size={18} />
              </span>
            </span>
          </label>
        </div>

        {visible.length > 0 ? (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((vehicle) => (
              <li key={vehicle.slug}>
                {/* The wireframe tints its leading card and this page still
                    does not pass `highlight`. The reason used to be contrast:
                    over the old grey band the tint composited to #E6ECF7 and
                    the card's muted metadata fell to 4.16:1. That objection
                    is gone — the band is white, the tint composites to
                    #F1F5FF, and a tinted card sets its metadata in ink
                    anyway. Turning it on is a live decision, not a blocked
                    one; Home already passes `highlight={index === 0}`. */}
                <VehicleCard vehicle={vehicle} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-card border border-border bg-bg p-8 text-center sm:p-12">
            <h3 className="font-display text-h3-sm text-ink lg:text-h3">
              {VEHICLES_PAGE.empty.heading}
            </h3>
            <p className="mx-auto mt-3 max-w-md font-body text-body text-muted">
              {VEHICLES_PAGE.empty.body}
            </p>
            <div className="mt-7 flex justify-center">
              <Button onClick={reset}>{VEHICLES_PAGE.empty.cta}</Button>
            </div>
          </div>
        )}

        {/* The wrapper is conditional as well as the component, so the hidden
            single-page case leaves no empty gap under the grid. */}
        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination page={current} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </Section>

      {/* ── Value band and showroom call to action ───────────────────── */}
      <Section tone="white">
        <ValueBand tone="surface" />
        <div className="mt-6">
          <ShowroomCta />
        </div>
      </Section>
    </>
  )
}
