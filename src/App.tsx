import { BrowserRouter, Route, Routes } from 'react-router'
import { SiteLayout } from './components/SiteLayout'
import { PlaceholderPage } from './components/PlaceholderPage'
import { BookAMeeting } from './pages/BookAMeeting'
import { Brand } from './pages/Brand'
import { Contact } from './pages/Contact'
import { Home } from './pages/Home'
import { StyleGuide } from './pages/StyleGuide'
import { VehicleDetail } from './pages/VehicleDetail'
import { Vehicles } from './pages/Vehicles'

export default function App() {
  return (
    <BrowserRouter>
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
