import { useQuery } from '@tanstack/react-query'
import DeviceLink from './DeviceLink'
import useCurrentAuthorizationOptions from '@/hooks/queries/authorization/UseCurrentAuthorizationOptions'
import useProjectDevicesOptions from '@/hooks/queries/device/UseProjectDevicesOptions'

export default function DeviceLinkList() {
  const {
    data: devices,
    error,
    isPending,
  } = useQuery(useProjectDevicesOptions())
  const { data: session } = useQuery(useCurrentAuthorizationOptions())

  if (isPending || error) return null

  return (
    <div className='@container/device-link-list w-full flex flex-col'>
      {devices.map((device) => (
        <DeviceLink
          key={device.device_id}
          device={device}
          to="/session/$sessionId/device/$deviceId"
          params={{
            sessionId: String(session?.session.session_id),
            deviceId: String(device.device_id),
          }}
        />
      ))}
    </div>
  )
}
