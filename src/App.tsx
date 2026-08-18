import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { SiteLayout } from './components/SiteLayout'
import { PlaceholderPage } from './components/PlaceholderPage'
import { BookAMeeting } from './pages/BookAMeeting'
import { Brand } from './pages/Brand'
import { Contact } from './pages/Contact'
import { Home } from './pages/Home'
import { StyleGuide } from './pages/StyleGuide'
import { VehicleDetail } from './pages/VehicleDetail'
import { Vehicles } from './pages/Vehicles'

/**
 * react-router does no scroll restoration of its own, so a client-side
 * navigation keeps the offset of the route it came from — follow a card from
 * halfway down the inventory and the vehicle page opens halfway down.
 *
 * The hash guard is the whole subtlety. The vehicle template's tab row is
 * four in-page anchors (#overview, #features, #gallery, #specifications);
 * scrolling to the top on every location change would fight the browser for
 * each of them. A location with a hash already says where it wants to be.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="vehicles/:slug" element={<VehicleDetail />} />
          <Route path="brands/:brand" element={<Brand />} />
          <Route path="book-a-meeting" element={<BookAMeeting />} />
          <Route path="contact" element={<Contact />} />

          {/* Not in the v1 page list — a build-time aid, kept so a mistyped
              URL shows the site chrome rather than an empty document. */}
          <Route path="styleguide" element={<StyleGuide />} />
          <Route
            path="*"
            element={
              <PlaceholderPage
                title="Page not found"
                scope="That address does not match a page on this site."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
