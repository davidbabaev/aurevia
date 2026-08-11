import type { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  /** "narrow" is for reading-width content such as the meeting form. */
  width?: 'site' | 'narrow'
}

const WIDTHS = {
  site: 'max-w-site',
  narrow: 'max-w-narrow',
} as const

/**
 * Horizontal gutter and measure. Takes no className on purpose — a caller
 * that needs different padding wraps this rather than overriding it.
 */
export function Container({ children, width = 'site' }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-gutter-sm sm:px-gutter lg:px-gutter-lg ${WIDTHS[width]}`}
    >
      {children}
    </div>
  )
}
