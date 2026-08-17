import { useState } from 'react'

export interface GalleryShot {
  /** File stem under /images/vehicles/<slug>/ — exterior, interior, … */
  key: string
  label: string
}

interface GalleryProps {
  vehicleSlug: string
  vehicleName: string
  shots: readonly GalleryShot[]
}

/**
 * The "every angle" strip: one large frame with a row of thumbnails beneath
 * it. Which shots exist is decided by the caller from what the manifest
 * actually generated, so a missing file can never be requested here.
 *
 * The selected thumbnail is marked with an ink ring rather than an accent
 * one — this sits on white, where accent is 2.41:1 and cannot carry meaning
 * on its own (section 4).
 */
export function Gallery({ vehicleSlug, vehicleName, shots }: GalleryProps) {
  const [active, setActive] = useState(0)
  const current = shots[active] ?? shots[0]

  return (
    <div>
      <div className="overflow-hidden rounded-card border border-border bg-surface">
        <img
          key={current.key}
          src={`/images/vehicles/${vehicleSlug}/${current.key}.webp`}
          alt={`${vehicleName} — ${current.label}`}
          width={1344}
          height={1008}
          decoding="async"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {shots.map((shot, index) => (
          <li key={shot.key}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-current={index === active ? 'true' : undefined}
              className={[
                'block w-full overflow-hidden rounded-control border-2 bg-surface transition-colors',
                index === active ? 'border-ink' : 'border-border hover:border-muted',
              ].join(' ')}
            >
              <img
                src={`/images/vehicles/${vehicleSlug}/${shot.key}.webp`}
                alt={shot.label}
                width={320}
                height={240}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
