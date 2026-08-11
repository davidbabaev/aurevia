import type { ReactNode } from 'react'
import { Container } from './Container'

type SectionTone = 'white' | 'surface' | 'ink' | 'graphite'
type SectionSpacing = 'default' | 'tight' | 'none'

interface SectionProps {
  children: ReactNode
  /** Drives the alternating white / light-grey / obsidian page rhythm. */
  tone?: SectionTone
  spacing?: SectionSpacing
  /** Set false to lay out edge-to-edge; the section supplies its own measure. */
  contained?: boolean
  width?: 'site' | 'narrow'
  id?: string
  label?: string
}

/**
 * Each tone carries its own default text colour so a section is legible by
 * construction. On the dark tones the body colour is white rather than muted
 * — muted reaches only 4.01:1 on ink and 3.50:1 on graphite.
 */
const TONES: Record<SectionTone, string> = {
  white: 'bg-bg text-ink',
  surface: 'bg-surface text-ink',
  ink: 'bg-ink text-bg',
  graphite: 'bg-graphite text-bg',
}

const SPACING: Record<SectionSpacing, string> = {
  default: 'py-section-sm lg:py-section',
  tight: 'py-section-tight',
  none: '',
}

export function Section({
  children,
  tone = 'white',
  spacing = 'default',
  contained = true,
  width = 'site',
  id,
  label,
}: SectionProps) {
  return (
    <section id={id} aria-label={label} className={`${TONES[tone]} ${SPACING[spacing]}`}>
      {contained ? <Container width={width}>{children}</Container> : children}
    </section>
  )
}
