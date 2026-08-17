import { Link } from 'react-router'
import { Icon } from './Icon'

interface BrandCardProps {
  name: string
  slug: string
}

/**
 * A 3:4 portrait image with the manufacturer name over its top third and a
 * round arrow in the bottom corner, per the wireframe.
 *
 * The name is set as text over the photograph — never a manufacturer logo
 * (section 6). The label sits on a graphite scrim rather than straight on the
 * image so it does not depend on how dark that particular frame happens to be.
 */
export function BrandCard({ name, slug }: BrandCardProps) {
  return (
    <Link
      to={`/brands/${slug}`}
      className="group relative block overflow-hidden rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <img
        src={`/images/brands/${slug}-card.webp`}
        alt=""
        width={768}
        height={1024}
        loading="lazy"
        decoding="async"
        className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />

      {/* A flat scrim, not a gradient (section 4). */}
      <span className="absolute inset-x-0 top-0 block bg-graphite/70 px-5 py-4">
        <span className="font-display text-h3-sm text-bg">{name}</span>
      </span>

      <span className="absolute right-4 bottom-4 flex size-11 items-center justify-center rounded-pill bg-bg text-ink transition-colors group-hover:bg-accent">
        <Icon name="arrow-up-right" size={20} />
      </span>
    </Link>
  )
}
