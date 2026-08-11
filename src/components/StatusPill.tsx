type Status = 'available' | 'sold' | 'new'

interface StatusPillProps {
  status: Status
  children?: string
}

/**
 * Status reads as a fill with ink text, never as coloured text. Both status
 * tokens fail badly as a foreground on white — available is 3.42:1 and sold
 * is 1.93:1 — but clear AA comfortably as a background under ink.
 */
const STATUSES: Record<Status, { className: string; defaultLabel: string }> = {
  available: { className: 'bg-available text-ink', defaultLabel: 'Available' },
  sold: { className: 'bg-sold text-ink', defaultLabel: 'Sold' },
  new: { className: 'bg-accent text-ink', defaultLabel: 'New' },
}

export function StatusPill({ status, children }: StatusPillProps) {
  const { className, defaultLabel } = STATUSES[status]
  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 font-body text-caption font-semibold ${className}`}
    >
      {children ?? defaultLabel}
    </span>
  )
}
