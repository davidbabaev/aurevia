import { Link } from 'react-router'
import { Container } from './Container'
import { Icon } from './Icon'
import type { IconName } from './Icon'
import { Wordmark } from './Wordmark'

/**
 * Contact values are [REPLACE] on purpose. The three wireframes disagree —
 * Tel Aviv, Miami, and bare placeholders — so there is no real value to take
 * from them, and section 5 forbids inventing one.
 */
const CONTACT: { icon: IconName; lines: string[] }[] = [
  { icon: 'pin', lines: ['[REPLACE] street address', '[REPLACE] city, country'] },
  { icon: 'phone', lines: ['[REPLACE] phone number'] },
  { icon: 'mail', lines: ['[REPLACE] email address'] },
  { icon: 'clock', lines: ['[REPLACE] opening hours'] },
]

const BRANDS = [
  { to: '/brands/mercedes-benz', label: 'Mercedes-Benz' },
  { to: '/brands/audi', label: 'Audi' },
  { to: '/brands/bmw', label: 'BMW' },
  { to: '/brands/porsche', label: 'Porsche' },
]

// About Us, Terms, Privacy and Accessibility appear in the wireframes but are
// v2 pages (section 1), so they are not linked yet.
const EXPLORE = [
  { to: '/vehicles', label: 'All vehicles' },
  { to: '/book-a-meeting', label: 'Book a meeting' },
  { to: '/contact', label: 'Contact' },
]

const SOCIAL: { icon: IconName; label: string }[] = [
  { icon: 'instagram', label: 'Instagram' },
  { icon: 'facebook', label: 'Facebook' },
  { icon: 'youtube', label: 'YouTube' },
  { icon: 'linkedin', label: 'LinkedIn' },
]

function FooterColumn({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h2 className="font-display text-body font-bold text-bg">{title}</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="font-body text-body-sm text-border hover:text-bg focus-visible:outline-bg"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-ink text-bg">
      <Container>
        <div className="grid gap-12 py-section-sm lg:grid-cols-4 lg:gap-8 lg:py-section-tight">
          <div className="flex flex-col gap-5">
            <Wordmark tone="bg" />
            <p className="max-w-xs font-body text-body-sm text-border">
              Aurevia Premium Motors presents selected vehicles from the world's
              leading automotive brands.
            </p>
          </div>

          <FooterColumn title="Brands" links={BRANDS} />
          <FooterColumn title="Explore" links={EXPLORE} />

          <div>
            <h2 className="font-display text-body font-bold text-bg">Contact</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {CONTACT.map((item) => (
                <li key={item.icon} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-border">
                    <Icon name={item.icon} size={16} />
                  </span>
                  <span className="font-body text-body-sm text-border">
                    {item.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-graphite py-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="font-body text-body-sm text-border">
            © 2026 Aurevia Premium Motors
          </p>
          <ul className="flex items-center gap-5">
            {SOCIAL.map((item) => (
              <li key={item.icon}>
                <a
                  href="[REPLACE]"
                  className="block text-border hover:text-bg focus-visible:outline-bg"
                >
                  <Icon name={item.icon} size={20} label={item.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  )
}
