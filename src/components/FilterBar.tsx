import { useId } from 'react'
import { VEHICLES_PAGE } from '../data/copy'
import type { FilterState } from '../lib/filters'
import { Icon } from './Icon'

interface FilterBarProps {
  value: FilterState
  onChange: (next: FilterState) => void
  onReset: () => void
  brands: readonly string[]
  types: readonly string[]
  fuels: readonly string[]
  prices: readonly string[]
  years: readonly string[]
}

/**
 * The filter card on the inventory page. The mockup shows eleven controls
 * across two rows, several of which have no data behind them — transmission,
 * mileage and status are either uniform across the twelve cars or absent, so
 * filtering by them would be a control that never changes the result.
 * The six built here each map to a real field.
 *
 * Every select carries a muted border: #DDE1E6 is 1.31:1 and may only draw
 * dividers, never the edge of a control (section 4).
 */
export function FilterBar({
  value,
  onChange,
  onReset,
  brands,
  types,
  fuels,
  prices,
  years,
}: FilterBarProps) {
  const id = useId()

  const selects = [
    { key: 'brand', label: VEHICLES_PAGE.filters.brand, any: VEHICLES_PAGE.filters.anyBrand, options: brands },
    { key: 'type', label: VEHICLES_PAGE.filters.type, any: VEHICLES_PAGE.filters.anyType, options: types },
    { key: 'fuel', label: VEHICLES_PAGE.filters.fuel, any: VEHICLES_PAGE.filters.anyFuel, options: fuels },
    { key: 'price', label: VEHICLES_PAGE.filters.price, any: VEHICLES_PAGE.filters.anyPrice, options: prices },
    { key: 'year', label: VEHICLES_PAGE.filters.year, any: VEHICLES_PAGE.filters.anyYear, options: years },
  ] as const

  return (
    <form
      aria-label={VEHICLES_PAGE.filters.heading}
      onSubmit={(event) => event.preventDefault()}
      className="rounded-card border border-border bg-bg p-4 sm:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-2 block font-body text-label text-muted uppercase">
            {VEHICLES_PAGE.filters.keyword}
          </span>
          <span className="relative block">
            <input
              type="search"
              name="keyword"
              id={`${id}-keyword`}
              value={value.keyword}
              onChange={(event) => onChange({ ...value, keyword: event.target.value })}
              placeholder={VEHICLES_PAGE.filters.keywordPlaceholder}
              className="h-12 w-full rounded-control border border-muted bg-bg pr-11 pl-4 font-body text-body-sm text-ink placeholder:text-muted"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink">
              <Icon name="search" size={18} />
            </span>
          </span>
        </label>

        {selects.map((select) => (
          <label key={select.key} className="block">
            <span className="mb-2 block font-body text-label text-muted uppercase">
              {select.label}
            </span>
            <span className="relative block">
              <select
                name={select.key}
                id={`${id}-${select.key}`}
                value={value[select.key]}
                onChange={(event) => onChange({ ...value, [select.key]: event.target.value })}
                className="h-12 w-full appearance-none rounded-control border border-muted bg-bg pr-11 pl-4 font-body text-body-sm text-ink"
              >
                <option value="">{select.any}</option>
                {select.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink">
                <Icon name="chevron-down" size={18} />
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-4 border-t border-border pt-5">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 font-body text-body-sm font-semibold text-ink hover:underline"
        >
          <Icon name="refresh" size={18} />
          {VEHICLES_PAGE.filters.reset}
        </button>
      </div>
    </form>
  )
}
