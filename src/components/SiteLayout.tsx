import { Outlet } from 'react-router'
import { Footer } from './Footer'
import { Nav } from './Nav'

/**
 * The nav floats over the top of the page rather than sitting above it, so
 * routes whose first section is not a full-bleed hero need to allow for it
 * themselves. Home is the only route where it overlaps artwork.
 */
export function SiteLayout() {
  // Column layout with a growing main keeps the footer at the bottom of the
  // viewport on short routes instead of leaving a white band beneath it.
  return (
    <div className="relative flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
