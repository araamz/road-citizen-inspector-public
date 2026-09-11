import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import DeviceLinkList from '@/components/DeviceLinkList/DeviceLinkList'
import DeviceItem from '@/components/DevicePreviewItem'
import HeroBanner from '@/components/Heros/HeroBanner'
import MarginGuard from '@/components/MarginGuard'
import FloatUpWrapper from '@/components/Motion/FloatUpWrapper'
import SectionLabel from '@/components/SectionLabel'
import useProjectDevicesSuspenseOptions from '@/hooks/queries/device/UseProjectDevicesOptions.suspense'

export const Route = createFileRoute('/session/$sessionId/_claimed/device/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: pinnedDevices } = useSuspenseQuery(
    useProjectDevicesSuspenseOptions({
      select: (data) => data.filter((device) => device.is_pinned),
    }),
  )

  return (
    <FloatUpWrapper>
      <div className="p-10 w-full flex justify-center min-h-full">
        <MarginGuard>
          <article className="flex flex-col gap-10">
            <header>
              <HeroBanner
                title="View Session Devices"
                description="View a session's traffic counting devices and gain insights with other visualizations."
              />
            </header>
            <section className="flex flex-col gap-10">
              <div className="flex flex-col gap-5">
                <div>
                  <SectionLabel textColor="black" size="lg">
                    Pinned Devices
                  </SectionLabel>
                  <p className="text-neutral-500 text-base/relaxed">
                    View devices the session administrator has pinned for quick
                    access to important traffic counting devices.
                  </p>
                </div>
                <div className="flex flex-col gap-10 @2xl:grid @2xl:grid-cols-2">
                  {pinnedDevices.map((device) => (
                    <DeviceItem
                      key={device.device_id}
                      showVisualization
                      device={device}
                    />
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel textColor="black" size="lg">
                  All Devices
                </SectionLabel>
                <DeviceLinkList />
              </div>
            </section>
          </article>
        </MarginGuard>
      </div>
    </FloatUpWrapper>
  )
}
