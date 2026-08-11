import { Container } from './Container'

interface PlaceholderPageProps {
  title: string
  /** What this route will hold once it is built. */
  scope: string
}

/**
 * Structural stand-in for a route that has not been built yet. Carries the
 * page's single h1 so the one-h1-per-page rule holds from the start.
 */
export function PlaceholderPage({ title, scope }: PlaceholderPageProps) {
  return (
    <div className="bg-bg pt-nav-clear pb-section-sm">
      <Container width="narrow">
        <h1 className="font-display text-display-sm text-ink lg:text-display">{title}</h1>
        <p className="mt-6 font-body text-body-lg text-muted">{scope}</p>
        <p className="mt-2 font-body text-body-sm text-muted">Not built yet.</p>
      </Container>
    </div>
  )
}
