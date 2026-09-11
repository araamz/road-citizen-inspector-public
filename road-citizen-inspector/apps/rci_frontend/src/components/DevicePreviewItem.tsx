import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import Container from './Container'
import Button from './Button'
import MetadataSnippetGroup from './MetadataSnippet/MetadataSnippetGroup'
import DevicePinnedMetadataSnippet from './MetadataSnippet/DevicePinnedMetadataSnippet'
import DeviceSummaryPreview from './DeviceBandPreview/DeviceIntervalDeviceSummary/DeviceSummaryPreview'
import type { DeviceData } from '@road-citizen-inspector/contracts'
import useDeviceOptions from '@/hooks/queries/device/UseDeviceOptions'

export type DevicePreviewItemProps = {
  device: DeviceData
  showVisualization?: boolean
}
export default function DevicePreviewItem({
  device,
  showVisualization,
}: DevicePreviewItemProps) {
  const { sessionId } = useParams({
    from: '/session/$sessionId',
  })
  const { data } = useQuery(
    useDeviceOptions(device.device_id, {
      placeholderData: device,
    }),
  )

  const navigate = useNavigate()

  const handleView = () => {
    navigate({
      to: '/session/$sessionId/device/$deviceId',
      params: {
        sessionId: sessionId,
        deviceId: String(device.device_id),
      }
    })  
  }

  return (
    <div className="@container/device-item h-full w-full">
      <Container className="w-full">
        <article className="flex flex-col gap-4 ">
          <header className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4'>
              <MetadataSnippetGroup>
                <DevicePinnedMetadataSnippet isPinned={data?.is_pinned ?? false} />
              </MetadataSnippetGroup>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-lg font-medium line-clamp-2">
                  {data?.label ? data.label : data?.tts_device_id}
                </h3>
                {data?.description && <p>{data.description}</p>}
              </div>
            </div>
          </header>
          {showVisualization && (
            <section className="min-h-full h-[300px] w-full">
              <DeviceSummaryPreview 
                deviceId={device.device_id}
              />
            </section>
          )}
          <footer className="flex justify-end">
            <Button size="sm" onClick={handleView}>View</Button>
          </footer>
        </article>
      </Container>
    </div>
  )
}
