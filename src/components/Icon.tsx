import type { ReactElement } from 'react'

export type IconName =
  | 'arrow-up-right'
  | 'arrow-right'
  | 'search'
  | 'chevron-down'
  | 'phone'
  | 'mail'
  | 'pin'
  | 'clock'
  | 'calendar'
  | 'check'
  | 'shield-check'
  | 'user'
  | 'refresh'
  | 'file-text'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'linkedin'

/**
 * Line icons drawn on a 24 grid, stroked in currentColor so they inherit
 * whatever the surrounding tone has already established as legible.
 *
 * Social glyphs are filled rather than stroked, which is why they set their
 * own fill and clear the stroke.
 */
const PATHS: Record<IconName, ReactElement> = {
  'arrow-up-right': (
    <>
      <path d="M7 17 17 7" />
      <path d="M8.5 7H17v8.5" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  'chevron-down': <path d="m6 9.5 6 6 6-6" />,
  phone: (
    <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.5s7-6 7-11.5a7 7 0 1 0-14 0c0 5.5 7 11.5 7 11.5Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4M16 3v4" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  'shield-check': (
    <>
      <path d="M12 3 5 6v5.5c0 4.4 3 8.1 7 9.5 4-1.4 7-5.1 7-9.5V6Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M5 20.5a7 7 0 0 1 14 0" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5" />
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5" />
      <path d="M4 20v-4.5h4.5M20 4v4.5h-4.5" />
    </>
  ),
  'file-text': (
    <>
      <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z" />
      <path d="M14 3.5V8.5H19" />
      <path d="M8.5 13h7M8.5 16.5h4.5" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path
      d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6A21 21 0 0 0 14.3 3.5c-2.4 0-4 1.45-4 4.1v2.3H7.6V13h2.7v8Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5 15.5 12l-5 2.5Z" fill="currentColor" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M8 10.5V17M8 7.6v.05" />
      <path d="M12 17v-3.6a2.4 2.4 0 0 1 4.8 0V17" />
    </>
  ),
}

interface IconProps {
  name: IconName
  /** Pixel box. Icons are drawn on a 24 grid and scale from there. */
  size?: number
  /** Supply when the icon is the only content and carries the meaning. */
  label?: string
}

export function Icon({ name, size = 24, label }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
