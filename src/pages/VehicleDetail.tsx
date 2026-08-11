import { useParams } from 'react-router'
import { PlaceholderPage } from '../components/PlaceholderPage'

/** One template serving every vehicle in the local content files. */
export function VehicleDetail() {
  const { slug } = useParams()

  return (
    <PlaceholderPage
      title={slug ? `Vehicle: ${slug}` : 'Vehicle'}
      scope="Gallery, specifications, status and the prompt to book a meeting about this vehicle."
    />
  )
}
