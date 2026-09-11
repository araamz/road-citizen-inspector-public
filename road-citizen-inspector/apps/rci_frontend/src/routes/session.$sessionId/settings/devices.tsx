import { createFileRoute, redirect } from '@tanstack/react-router'
import DeviceTable from '@/components/DeviceTable'
import HeroBanner from '@/components/Heros/HeroBanner'
import SlideOverWrapper from '@/components/Motion/SlideOverWrapper'
import useProjectDevicesOptions from '@/hooks/queries/device/UseProjectDevicesOptions'

export const Route = createFileRoute('/session/$sessionId/settings/devices')({
  component: RouteComponent,
  beforeLoad: ({ context: { queryClient, authorization }, params: { sessionId } }) => {
    if (authorization.session?.status === 'claimed')
      return queryClient.ensureQueryData(useProjectDevicesOptions())

    throw redirect({
      to: '/session/$sessionId',
      params: {
        sessionId: sessionId,
      },
    })
  },
})

function RouteComponent() {
  return (
    <SlideOverWrapper>
      <div className="flex flex-col gap-10 w-full">
        <div className="w-full">
          <HeroBanner
            title="Manage Session Devices"
            description="Manage devices metadata and impact on traffic study information."
          />
        </div>
        <div className="flex flex-col">
          <div className="w-full">
            <DeviceTable />
          </div>
        </div>
      </div>
    </SlideOverWrapper>
  )
}
