import { HiFolder } from 'react-icons/hi2'
import AppPopover from '../../AppPopover'
import IconPlaceholder from '../../IconPlaceholder'
import CurrentSessionContainer from './CurrentSessionContainer'
import useAuthorization from '@/authorization/useAuthorization'
import { useMediaQuery } from "@uidotdev/usehooks";

export default function CurrentSession() {
  const { session } = useAuthorization()

  // https://tailwindcss.com/docs/responsive-design
  const isLargeDevice = useMediaQuery("(width >= 64rem)")
  
  if (!session) return undefined

  return (
    <AppPopover
      contentElement={<CurrentSessionContainer />}
      contentOptions={{
        side: isLargeDevice ? 'left' : 'bottom',
        align: 'center',
        collisionPadding: 20,
      }}
    >
      <IconPlaceholder
        icon={HiFolder}
        tooltipOptions={{
          contentOptions: {
            side: isLargeDevice ? 'left' : 'bottom',
          },
          label: 'Current Session',
        }}
      />
    </AppPopover>
  )
}
