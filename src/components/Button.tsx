import type { ReactNode } from 'react'
import { Link } from 'react-router'

type ButtonVariant = 'accent' | 'secondary' | 'dark-section'
type ButtonSize = 'md' | 'sm'
type ButtonShape = 'pill' | 'control'

interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
  disabled?: boolean
  /** Internal route — renders a router Link. */
  to?: string
  /** External destination — renders an anchor. */
  href?: string
  type?: 'button' | 'submit'
  onClick?: () => void
  fullWidth?: boolean
  /** Use when the label alone does not describe the action. */
  label?: string
}

/**
 * Variants exist so nobody forks this component to get a different colour
 * (section 4). Every fill pairs with the only text colour that clears AA on
 * it: ink on accent is 8.22:1, white on accent is 2.41:1 and is never used.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  accent: 'bg-accent text-ink hover:opacity-90 focus-visible:outline-ink',
  secondary:
    'bg-bg text-ink border border-muted hover:border-ink focus-visible:outline-ink',
  // No background utility: the band behind it shows through unchanged.
  'dark-section':
    'text-bg border border-border hover:bg-bg hover:text-ink focus-visible:outline-bg',
}

const SIZES: Record<ButtonSize, string> = {
  md: 'h-12 px-6 text-body',
  sm: 'h-10 px-5 text-body-sm',
}

const SHAPES: Record<ButtonShape, string> = {
  pill: 'rounded-pill',
  control: 'rounded-control',
}

const BASE =
  'inline-flex items-center justify-center gap-2 font-body font-semibold ' +
  'whitespace-nowrap transition-opacity select-none ' +
  'focus-visible:outline-2 focus-visible:-outline-offset-4'

/**
 * Disabled wins over every variant colour, including its hover.
 *
 * The fill is the sold token — the palette's own word for unavailable — with
 * ink on top at 10.29:1. The earlier pairing of muted on border sat at
 * 3.76:1; WCAG exempts disabled controls, but the exemption is not a reason
 * to ship illegible text when a token that passes says the same thing. The
 * inert read comes from the flat grey fill, not from dimming the label.
 */
const DISABLED =
  'disabled:bg-sold disabled:text-ink disabled:border-sold ' +
  'disabled:cursor-not-allowed disabled:hover:opacity-100 ' +
  'disabled:hover:bg-sold disabled:hover:text-ink'

export function Button({
  children,
  variant = 'accent',
  size = 'md',
  shape = 'pill',
  disabled = false,
  to,
  href,
  type = 'button',
  onClick,
  fullWidth = false,
  label,
}: ButtonProps) {
  const className = [
    BASE,
    VARIANTS[variant],
    SIZES[size],
    SHAPES[shape],
    fullWidth ? 'w-full' : '',
    DISABLED,
  ]
    .filter(Boolean)
    .join(' ')

  // A disabled link is not a thing the platform supports, so anything
  // disabled degrades to a real disabled button rather than a dead anchor.
  if (!disabled && to) {
    return (
      <Link to={to} className={className} aria-label={label} onClick={onClick}>
        {children}
      </Link>
    )
  }

  if (!disabled && href) {
    return (
      <a href={href} className={className} aria-label={label} onClick={onClick}>
        {children}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
  )
}
