import { Link } from 'react-router'
import { Icon } from './Icon'

interface BrandCardProps {
  name: string
  slug: string
  /**
   * The first card in the row. The wireframe fills only that card's arrow
   * with accent and leaves the other three white — it marks the head of the
   * row, it is not a state. Defaults off so a lone card is never tinted.
   */
  highlight?: boolean
}

/**
 * A 3:4 portrait image with the manufacturer name over its top third and a
 * round arrow in the bottom corner, per the wireframe.
 *
 * The name is set as text over the photograph — never a manufacturer logo
 * (section 6).
 */
export function BrandCard({ name, slug, highlight = false }: BrandCardProps) {
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

      {/* A scrim, not a panel. The earlier flat graphite block read as a title
          bar bolted to the top of the photograph; in the wireframe the name
          sits on the image itself. The gradient is the second of the two
          exceptions section 4's no-gradient rule is carrying for these cards,
          and it exists only so the label does not depend on how dark a
          particular frame happens to be at the top edge. It fades to ink at
          zero alpha — bg-transparent does not exist once --color-* is
          cleared. */}
      {/* The stops are set from measurement, not by eye. The label is 20px/700
          — WCAG large text, so the floor is 3:1 — and it is white, so what
          matters is the brightest pixel the glyphs can land on. Sampled off
          the rendered page with the label hidden, from-65/via-25 gave
          4.32:1 at 1280 but only 3.22:1 at 390: the band is a percentage of
          a card that is barely half as tall there, so the text sits much
          further down the falloff and catches the pale concrete in the Audi
          and BMW frames. 0.22 over the floor is not a margin this palette
          ships — section 4 rejects 4.49:1 for normal text on the same
          reasoning. Raising the two upper stops moves the worst case to
          5.1:1 at 390 and leaves it a gradient rather than the panel this
          replaced. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 block h-2/5 bg-linear-to-b from-ink/75 via-ink/45 to-ink/0"
      />
      <span className="absolute inset-x-0 top-0 block px-5 py-4">
        <span className="font-display text-h3-sm text-bg">{name}</span>
      </span>

      {/* The glyph is ink on both fills. Accent is a background only — it is
          2.41:1 on white and a white arrow on an accent disc would fail the
          same way (section 4). */}
      <span
        className={[
          'absolute right-4 bottom-4 flex size-11 items-center justify-center rounded-pill text-ink transition-colors',
          highlight ? 'bg-accent' : 'bg-bg group-hover:bg-accent',
        ].join(' ')}
      >
        <Icon name="arrow-up-right" size={20} />
      </span>
    </Link>
  )
}
