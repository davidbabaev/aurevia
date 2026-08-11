import { Link } from 'react-router'

interface WordmarkProps {
  /** "ink" for the white nav pill, "bg" for the obsidian footer. */
  tone?: 'ink' | 'bg'
  to?: string
}

/**
 * Text setting of the Aurevia lockup.
 *
 * docs/reference/brand-logo-sheet.png supplies five official versions, but
 * only as raster. Until the mark is available as SVG this stands in with the
 * wordmark's letterspacing and rule detail; the "A" glyph is not faked.
 */
export function Wordmark({ tone = 'ink', to = '/' }: WordmarkProps) {
  const colour = tone === 'ink' ? 'text-ink' : 'text-bg'
  // The rules are blue in both official versions that carry them — the
  // primary horizontal lockup and the white-on-black one — so they do not
  // flip with tone the way the lettering does. --logo-blue is the mark's own
  // colour, not --color-accent; see the note in index.css.
  const ruleColour = 'bg-[var(--logo-blue)]'

  return (
    <Link to={to} className={`inline-flex flex-col gap-1 ${colour}`} aria-label="Aurevia Premium Motors — home">
      <span className="font-display text-body font-extrabold leading-none tracking-[0.18em] whitespace-nowrap sm:text-h3-sm sm:tracking-[0.22em]">
        AUREVIA
      </span>
      {/* The flanking rules are the first thing to go when the nav pill gets
          tight at 390px; the subtitle itself must never wrap. */}
      <span className="flex items-center gap-2 whitespace-nowrap" aria-hidden="true">
        <span className={`hidden h-px w-4 sm:block ${ruleColour}`} />
        <span className="font-body text-micro">PREMIUM MOTORS</span>
        <span className={`hidden h-px w-4 sm:block ${ruleColour}`} />
      </span>
    </Link>
  )
}
