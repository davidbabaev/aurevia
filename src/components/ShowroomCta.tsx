import { HOME } from '../data/copy'
import { Button } from './Button'

/**
 * The obsidian conversion band that closes Home and Vehicles: copy left, the
 * showroom photograph across the middle, and the accent panel on the right.
 *
 * The accent panel is a fill with ink text on it, which is the only pairing
 * the palette allows — white on accent measures 2.41:1 (section 4). It stays
 * a panel rather than a full-width band so accent keeps well under a tenth of
 * the screen.
 */
export function ShowroomCta() {
  return (
    <div className="relative overflow-hidden rounded-card bg-ink">
      <img
        src="/images/hero/showroom-visit.webp"
        alt=""
        width={1344}
        height={768}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover opacity-70"
      />

      <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center lg:gap-12 lg:p-12">
        <div className="max-w-md">
          <h2 className="font-display text-h2-sm text-bg lg:text-h2">
            {HOME.showroomCta.heading}
          </h2>
          <p className="mt-4 font-body text-body text-border">{HOME.showroomCta.body}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button to="/book-a-meeting">{HOME.showroomCta.cta}</Button>
            <Button to="/vehicles" variant="dark-section">
              {HOME.featured.viewAll}
            </Button>
          </div>
        </div>

        <p className="flex min-h-[132px] items-center justify-center rounded-card bg-accent px-6 py-8 text-center font-display text-h3-sm text-ink">
          {HOME.showroomCta.badge}
        </p>
      </div>
    </div>
  )
}
