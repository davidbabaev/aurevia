/**
 * The inventory filter state, shared by the page that owns it and the bar
 * that edits it.
 *
 * It lives in lib rather than beside the component because a file that exports
 * a component and a constant breaks fast refresh
 * (react-refresh/only-export-components).
 */
export interface FilterState {
  keyword: string
  brand: string
  type: string
  fuel: string
  price: string
  year: string
}

export const EMPTY_FILTERS: FilterState = {
  keyword: '',
  brand: '',
  type: '',
  fuel: '',
  price: '',
  year: '',
}
