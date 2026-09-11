import { useQuery } from '@tanstack/react-query'
import Skeleton from '../Skeleton'
import type { DeviceData } from '@road-citizen-inspector/contracts'
import useDeviceOptions from '@/hooks/queries/device/UseDeviceOptions'

export type DeviceLabelCellProps = {
  deviceId: DeviceData['device_id']
}
export default function DeviceLabelCell({ deviceId }: DeviceLabelCellProps) {
  const { data, isPending } = useQuery(useDeviceOptions(deviceId))

  return (
    <Skeleton height="md" className="w-full" isLoading={isPending}>
      <div className='w-full'>
        <p className='wrap-anywhere'>{data?.label ?? data?.tts_device_id}</p>
        {data?.label ? (
          <p className="text-xs text-neutral-500">{data.tts_device_id}</p>
        ) : undefined}
      </div>
    </Skeleton>
  )
}
