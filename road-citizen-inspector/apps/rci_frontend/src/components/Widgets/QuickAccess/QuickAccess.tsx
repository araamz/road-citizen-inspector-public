import AppPopover from './../../AppPopover'
import QuickAccessContainer from './QuickAccessContainer'
import { useEffect, useState } from 'react'
import { HiEllipsisVertical } from 'react-icons/hi2'
import { useRouterState } from '@tanstack/react-router'
import IconPlaceholder from './../../IconPlaceholder'
import { useMediaQuery } from "@uidotdev/usehooks";

export default function QuickAccess() {
  const [open, setOpen] = useState<boolean>(false)

  const router = useRouterState()

  // https://tailwindcss.com/docs/responsive-design
  const isLargeDevice = useMediaQuery("(width >= 64rem)")

  useEffect(() => {
    setOpen(false)
  }, [router.location.pathname])

  return (
    <AppPopover
      className="z-[2000] overflow-auto"
      popoverOptions={{
        open: open,
        onOpenChange: (open) => setOpen(open)
      }}
      contentOptions={{
        side: isLargeDevice ? 'left' : 'bottom',
        align: 'start',
        collisionPadding: {
          left: 10,
          right: 20
        }
      }}
      contentElement={<QuickAccessContainer />}
    >
      <IconPlaceholder
        tooltipOptions={{
          label: "Quick Access",
          contentOptions: {
            side: isLargeDevice ? 'left' : 'bottom',
          }
        }}
        icon={HiEllipsisVertical}
        size='lg'
        className="group-data-[state=open]:bg-neutral-200 group-data-[state=open]:text-black"
      />
    </AppPopover>
  )
}
