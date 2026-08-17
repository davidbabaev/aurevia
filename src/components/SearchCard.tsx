import { useId, useState } from 'react'
import { HOME } from '../data/copy'
import { Button } from './Button'
import { Icon } from './Icon'

interface SearchCardProps {
  /** Options per select, in the order the wireframe lists them. */
  brands: readonly string[]
  models: readonly string[]
  years: readonly string[]
  prices: readonly string[]
}

/**
 * The signature element (section 4): a white card at radius 16 with a
 * segmented tab row sitting on its top edge, four pill selects and one accent
 * button inside.
 *
 * The overlap is the whole point and it is done with a negative top margin of
 * 40% of the card's own height, applied only from 768px up. Below that the
 * brief says it drops below the hero instead, so the margin is simply absent
 * and the card sits in normal flow.
 *
 * The card cannot search anything — there is no index and no server (section
 * 1). It is a real form that routes to /vehicles, where the filtering lives.
 */
export function SearchCard({ brands, models, years, prices }: SearchCardProps) {
  const [tab, setTab] = useState(0)
  const id = useId()

  const selects = [
    { key: 'brand', label: HOME.search.fields.brand, options: brands },
    { key: 'model', label: HOME.search.fields.model, options: models },
    { key: 'year', label: HOME.search.fields.year, options: years },
    { key: 'price', label: HOME.search.fields.price, options: prices },
  ] as const

  return (
    // -mt-[40%-of-own-height] is not expressible, so the overlap is set as a
    // fraction of the card's measured height at each breakpoint. 96px is 40%
    // of the 240px the card settles at on desktop.
    <div className="relative z-10 md:-mt-[96px]">
      <div className="rounded-card border border-border bg-bg">
        {/* Tab row on the top edge, not inside the padding box. */}
        <div
          role="tablist"
          aria-label={HOME.search.submit}
          className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-3"
        >
          {HOME.search.tabs.map((label, index) => (
            <button
              key={label}
              role="tab"
              type="button"
              aria-selected={tab === index}
              onClick={() => setTab(index)}
              className={[
                'shrink-0 rounded-t-control px-4 py-3 font-body text-body-sm font-semibold',
                'border-b-2 transition-colors',
                tab === index
                  ? 'border-ink text-ink'
                  : 'border-bg text-muted hover:text-ink',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        <form
          action="/vehicles"
          className="grid gap-3 p-4 sm:p-5 md:grid-cols-2 lg:grid-cols-5 lg:items-end"
        >
          {selects.map((select) => (
            <label key={select.key} className="block">
              <span className="sr-only">{select.label}</span>
              <span className="relative block">
                <select
                  name={select.key}
                  id={`${id}-${select.key}`}
                  defaultValue=""
                  // Border is muted, not border: a border that identifies a
                  // control has to clear 3:1 and #DDE1E6 reaches 1.31:1.
                  className="h-12 w-full appearance-none rounded-pill border border-muted bg-bg pr-10 pl-5 font-body text-body-sm text-ink"
                >
                  <option value="">{select.label}</option>
                  {select.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-ink">
                  <Icon name="chevron-down" size={18} />
                </span>
              </span>
            </label>
          ))}

          <Button type="submit" fullWidth>
            <Icon name="search" size={18} />
            {HOME.search.submit}
          </Button>
        </form>
      </div>
    </div>
  )
}
