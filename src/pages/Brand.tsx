import { useParams } from 'react-router'
import { PlaceholderPage } from '../components/PlaceholderPage'

/** One template serving Mercedes-Benz, Audi, BMW and Porsche. */
export function Brand() {
  const { brand } = useParams()

  return (
    <PlaceholderPage
      title={brand ? `Brand: ${brand}` : 'Brand'}
      scope="One template for all four brands — brand introduction and the vehicles held from that manufacturer."
    />
  )
}
