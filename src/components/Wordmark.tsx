import { Link } from 'react-router'
import logoFull from '../assets/logo-full.svg?raw'
import logoMark from '../assets/logo-mark.svg?raw'

type WordmarkVariant = 'full' | 'responsive'

interface WordmarkProps {
  /** "ink" for the white nav pill, "bg" for the obsidian footer. */
  tone?: 'ink' | 'bg'
  to?: string
  /**
   * "responsive" drops to the symbol below 640px. The full lockup needs about
   * 190px of width before its subtitle stops being a smudge, and the nav pill
   * has nothing like that to spare once the CTA is in it.
   */
  variant?: WordmarkVariant
}

/**
 * The lockup is inlined rather than referenced with <img> because the black
 * fills are currentColor: an <img> would resolve them against the SVG's own
 * document and always come out dark, so the footer's white-on-obsidian
 * version would be invisible. The markup is a build-time constant from our
 * own assets, not anything user-supplied.
 */
export function Wordmark({ tone = 'ink', to = '/', variant = 'full' }: WordmarkProps) {
  const colour = tone === 'ink' ? 'text-ink' : 'text-bg'
  const fill = '[&>svg]:h-auto [&>svg]:w-full'

  return (
    <Link
      to={to}
      className={`inline-block ${colour}`}
      aria-label="Aurevia Premium Motors — home"
    >
      {variant === 'responsive' ? (
        <>
          <span
            className={`block w-8 sm:hidden ${fill}`}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: logoMark }}
          />
          <span
            className={`hidden w-[190px] sm:block ${fill}`}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: logoFull }}
          />
        </>
      ) : (
        <span
          className={`block w-[200px] ${fill}`}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: logoFull }}
        />
      )}
    </Link>
  )
}
