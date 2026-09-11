import QuickAccessGroup from '../QuickAccessGroup'
import PrimaryLinkItem from './PrimaryLinkItem'
import { HiPlus, HiRectangleGroup } from 'react-icons/hi2'

export default function PriamryLinkGroup() {
  return (
    <QuickAccessGroup label="Quick Access">
      <PrimaryLinkItem to={'/'} icon={HiRectangleGroup}>
        Dashboard
      </PrimaryLinkItem>
      <PrimaryLinkItem to={'/generate'} icon={HiPlus}>
        Generate Session
      </PrimaryLinkItem>
    </QuickAccessGroup>
  )
}
