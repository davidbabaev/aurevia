interface CarShadowProps {
  /**
   * Which image box this sits under. The two boxes are an order of magnitude
   * apart — the card's is a 16:9 panel a couple of hundred pixels tall, the
   * body-style tile's is 64px — so one set of measurements cannot serve both:
   * a 12px blur under the tile smears the whole ellipse away, and a 4px blur
   * under the card reads as a hard grey bar.
   */
  size?: 'card' | 'tile'
}

/**
 * The soft ellipse beneath a cut-out car, so the car sits on a surface
 * instead of floating in the middle of a white panel. Every cut-out in the
 * set is keyed to transparent, which is what removes the ground under it;
 * this puts a suggestion of that ground back.
 *
 * Section 4 bans shadows beyond a 1px hairline. This is the one authorised
 * exception, together with the BrandCard scrim, and it is written once here
 * rather than twice so the exception stays countable.
 *
 * It is built from --color-ink at low alpha rather than a colour-stop
 * gradient, so no raw colour enters the file (section 4). Complete class
 * strings only — the sizes are an explicit map, never interpolated.
 */
const SIZES = {
  // The card's box is 16:9 and the cut-outs are nearer 2:1, so object-contain
  // letterboxes them: measured against the files, the car's wheels land about
  // 11% up from the bottom edge of the box, which is where the ellipse is
  // centred. Height is a percentage so it tracks the box between 390 and 1280
  // rather than staying a fixed 12px on a card that doubled in width.
  card: 'inset-x-[16%] bottom-[6%] h-[9%] blur-md',
  // The tile's box is a fixed 64px at every width, so fixed measurements are
  // right here. The silhouette is letterboxed the other way — it fills the
  // height and leaves margin left and right — so the ellipse is inset much
  // further than the card's.
  tile: 'inset-x-[26%] bottom-[3%] h-1.5 blur-xs',
} as const

// Alpha is per size, not shared. ink/20 was set once for both and measured
// too faint against the wireframe at either scale: under the card it read as
// a smudge rather than a contact shadow, and under the 64px tile it was
// close to invisible. The tile carries the higher value because its ellipse
// is a sixth the area — the same alpha spread over far fewer pixels reads
// lighter, not equal.
const ALPHAS = {
  card: 'bg-ink/30',
  tile: 'bg-ink/35',
} as const

export function CarShadow({ size = 'card' }: CarShadowProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-[50%] ${ALPHAS[size]} ${SIZES[size]}`}
    />
  )
}
