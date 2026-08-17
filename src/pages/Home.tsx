import { BRANDS, HOME } from '../data/copy'
import { VEHICLES } from '../data/vehicles'
import { BrandCard } from '../components/BrandCard'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { Icon } from '../components/Icon'
import { SearchCard } from '../components/SearchCard'
import { Section } from '../components/Section'
import { ShowroomCta } from '../components/ShowroomCta'
import { ValueBand } from '../components/ValueBand'
import { VehicleCard } from '../components/VehicleCard'

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/** Four manufacturers, in the order the wireframe cards run. */
const BRAND_CARDS = Object.entries(BRANDS).map(([slug, brand]) => ({
  slug,
  name: brand.name,
}))

const FEATURED = VEHICLES.filter((vehicle) => vehicle.featured)

/**
 * Every option in the search card is read off the inventory rather than typed
 * out, so a select can never offer something the showroom does not have.
 */
const BRAND_OPTIONS = BRAND_CARDS.map((brand) => brand.name)
const MODEL_OPTIONS = Array.from(new Set(VEHICLES.map((vehicle) => vehicle.model)))
const YEAR_OPTIONS = Array.from(new Set(VEHICLES.map((vehicle) => String(vehicle.year))))

/**
 * Price bands are derived, not invented: the step is rounded outwards from the
 * cheapest and dearest cars actually in stock and each label is two formatted
 * figures, so no band is ever empty.
 */
const PRICE_STEP = 50_000
const PRICE_OPTIONS = (() => {
  const points = VEHICLES.map((vehicle) => vehicle.price).filter(
    (price): price is number => price !== null,
  )
  const first = Math.floor(Math.min(...points) / PRICE_STEP) * PRICE_STEP
  const last = Math.ceil(Math.max(...points) / PRICE_STEP) * PRICE_STEP
  const bands: string[] = []
  for (let start = first; start < last; start += PRICE_STEP) {
    bands.push(`${money.format(start)} – ${money.format(start + PRICE_STEP)}`)
  }
  return bands
})()

export function Home() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────
          The headline sits in the left half, which is empty showroom floor
          at 3.9/255 — dark enough for white type without a scrim. Below
          768px the crop centres on the car, so the flat ink veil is carried
          there and only there. */}
      <section className="relative overflow-hidden bg-ink">
        <img
          src="/images/hero/home-hero.webp"
          alt=""
          width={1344}
          height={768}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-ink/65 md:hidden" />

        <Container>
          <div className="relative flex min-h-[560px] flex-col justify-end pt-nav-clear pb-14 md:min-h-[620px] md:pb-[140px] lg:min-h-[720px]">
            <div className="grid gap-7 lg:grid-cols-2 lg:items-end lg:gap-12">
              <div>
                <p className="font-body text-label text-border uppercase">
                  {HOME.hero.eyebrow}
                </p>
                <h1 className="mt-4 font-display text-display-sm text-bg lg:text-display">
                  {HOME.hero.heading}
                </h1>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button to="/vehicles">{HOME.hero.primaryCta}</Button>
                  <Button to="/book-a-meeting" variant="dark-section">
                    {HOME.hero.secondaryCta}
                  </Button>
                </div>
              </div>

              <p className="font-body text-body-lg-sm text-border lg:pb-2 lg:text-body-lg">
                {HOME.hero.support}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Search card ────────────────────────────────────────────────
          Deliberately not inside a Section: the component owns the 40%
          overlap and any section padding here would cancel it. */}
      <div className="pt-8 md:pt-0">
        <Container>
          <SearchCard
            brands={BRAND_OPTIONS}
            models={MODEL_OPTIONS}
            years={YEAR_OPTIONS}
            prices={PRICE_OPTIONS}
          />
        </Container>
      </div>

      {/* ── Explore by brand ───────────────────────────────────────────── */}
      <Section tone="white" id="brands">
        <h2 className="font-display text-h2-sm text-ink lg:text-h2">
          {HOME.brands.heading}
        </h2>
        <p className="mt-3 max-w-narrow font-body text-body text-muted">
          {HOME.brands.support}
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-4 lg:mt-10 lg:grid-cols-4 lg:gap-6">
          {BRAND_CARDS.map((brand) => (
            <li key={brand.slug}>
              <BrandCard name={brand.name} slug={brand.slug} />
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Statement ──────────────────────────────────────────────────
          Body copy is ink, not muted: muted on #F3F4F6 is 4.49:1 and fails
          by a hundredth (section 4). The disc behind the cut-out is accent
          as a background tint, which is the only job accent is allowed. */}
      <Section tone="white" spacing="tight">
        <div className="grid items-center gap-8 rounded-card bg-surface p-7 sm:p-10 lg:grid-cols-2 lg:gap-12 lg:p-12">
          <div>
            <h2 className="font-display text-h2-sm text-ink lg:text-h2">
              {HOME.statement.heading}
            </h2>
            <p className="mt-5 font-body text-body text-ink">{HOME.statement.body}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button to="/vehicles">{HOME.statement.primaryCta}</Button>
              <Button href="#featured" variant="secondary">
                {HOME.statement.secondaryCta}
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center py-6">
            <span
              aria-hidden
              className="absolute aspect-square h-[140%] rounded-pill bg-accent/15"
            />
            <img
              src="/images/hero/statement-s-class.webp"
              alt=""
              width={1040}
              height={365}
              loading="lazy"
              decoding="async"
              className="relative h-auto w-full object-contain"
            />
          </div>
        </div>
      </Section>

      {/* ── Featured vehicles ──────────────────────────────────────────── */}
      <Section tone="surface" id="featured">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-h2-sm text-ink lg:text-h2">
            {HOME.featured.heading}
          </h2>
          <Button to="/vehicles" size="sm">
            {HOME.featured.viewAll}
            <Icon name="arrow-right" size={18} />
          </Button>
        </div>

        {/* Four across at desktop, as the wireframe draws it — four vehicles
            carry `featured: true`, so a three-column grid left one orphaned on
            a second row. */}
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-6">
          {FEATURED.map((vehicle, index) => (
            <li key={vehicle.slug}>
              {/* One tinted card per grid, as the wireframe draws it. */}
              <VehicleCard vehicle={vehicle} highlight={index === 0} />
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Value band + showroom visit ────────────────────────────────
          Both are obsidian cards on white rather than full-bleed bands:
          each component carries its own 16px radius, so a dark section
          behind them would double the ground. */}
      <Section tone="white">
        <ValueBand tone="ink" />
        <div className="mt-6 lg:mt-8">
          <ShowroomCta />
        </div>
      </Section>
    </>
  )
}
