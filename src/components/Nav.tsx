import { NavLink } from 'react-router'
import { Button } from './Button'
import { Container } from './Container'
import { Wordmark } from './Wordmark'

/**
 * v1 navigation only. The wireframes also show Services, About and FAQ, plus
 * an account avatar and a second search field — all of which belong to v2 or
 * to the rental template this design came from (sections 1 and 4).
 */
const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/brands/mercedes-benz', label: 'Brands' },
  { to: '/contact', label: 'Contact' },
]

export function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 pt-4 lg:pt-6">
      <Container>
        <nav
          aria-label="Main"
          // Padding and gap tighten at 320px so the wordmark and the CTA fit
          // the pill without either of them wrapping.
          className="flex items-center justify-between gap-3 rounded-pill bg-bg px-4 py-3 sm:gap-4 sm:px-5 lg:px-6"
        >
          <Wordmark variant="responsive" />

          <ul className="hidden items-center gap-7 lg:flex">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    [
                      'font-display text-body-sm font-semibold text-ink',
                      // The inactive rule is drawn in the pill's own white so
                      // the label never shifts when it becomes active.
                      'border-b-2 pb-1 transition-colors',
                      isActive ? 'border-ink' : 'border-bg hover:border-border',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <Button to="/book-a-meeting" size="sm">
            Book a meeting
          </Button>
        </nav>
      </Container>
    </header>
  )
}
