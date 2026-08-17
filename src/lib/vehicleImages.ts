/**
 * Where a vehicle's imagery lives.
 *
 * The manifest that generates these files builds the filename from the swatch
 * name, so this is the same rule read back: index 0 is the paint the car was
 * photographed in and its cut-out is card.webp; every other entry is
 * colour-<slug>.webp in the same folder, where the slug is the name lowercased
 * with spaces hyphenated.
 *
 * It lives in lib rather than beside the component because a file that exports
 * a component and a helper breaks fast refresh (react-refresh/only-export-
 * components).
 */
export function swatchImage(vehicleSlug: string, colour: string, index: number) {
  if (index === 0) return `/images/vehicles/${vehicleSlug}/card.webp`
  const slug = colour.toLowerCase().replace(/\s+/g, '-')
  return `/images/vehicles/${vehicleSlug}/colour-${slug}.webp`
}
