import { PAGINATION } from '../data/copy'
import { Icon } from './Icon'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

/**
 * Built to the wireframe, and invisible at current inventory: twelve vehicles
 * at a page size of twelve is one page, and section 4 says it renders only
 * when there is more than one. Returning null is the normal state, not a bug.
 */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const step = 'flex size-11 items-center justify-center rounded-control border font-body text-body-sm'

  return (
    <nav aria-label={PAGINATION.current(page, totalPages)} className="flex justify-center">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          <button
            type="button"
            onClick={() => onChange(page - 1)}
            disabled={page === 1}
            aria-label={PAGINATION.previous}
            className={`${step} border-muted bg-bg text-ink disabled:border-sold disabled:bg-sold disabled:cursor-not-allowed`}
          >
            {/* One arrow glyph exists; previous is the same mark turned round. */}
            <span className="rotate-180">
              <Icon name="arrow-right" size={18} />
            </span>
          </button>
        </li>

        {pages.map((n) => (
          <li key={n}>
            <button
              type="button"
              onClick={() => onChange(n)}
              aria-label={PAGINATION.page(n)}
              aria-current={n === page ? 'page' : undefined}
              className={`${step} ${
                n === page ? 'border-accent bg-accent text-ink' : 'border-border bg-bg text-ink'
              }`}
            >
              {n}
            </button>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={() => onChange(page + 1)}
            disabled={page === totalPages}
            aria-label={PAGINATION.next}
            className={`${step} border-muted bg-bg text-ink disabled:border-sold disabled:bg-sold disabled:cursor-not-allowed`}
          >
            <Icon name="arrow-right" size={18} />
          </button>
        </li>
      </ul>
    </nav>
  )
}
