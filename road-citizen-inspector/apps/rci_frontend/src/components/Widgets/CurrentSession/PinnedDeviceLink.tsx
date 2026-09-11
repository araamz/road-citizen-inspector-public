import { Link } from '@tanstack/react-router'
import { HiSignal } from 'react-icons/hi2'
import WidgetItem from '../WidgetItem'
import type { DeviceData } from '@road-citizen-inspector/contracts'
import useAuthorization from '@/authorization/useAuthorization'

export type PinnedDeviceLinkProps = {
  device: DeviceData
}
export default function PinnedDeviceLink({ device }: PinnedDeviceLinkProps) {
  const { session } = useAuthorization()

  return (
    <Link
      to="/session/$sessionId/device/$deviceId"
      params={{
        deviceId: String(device.device_id),
        sessionId: String(session?.session_id),
      }}
      className="group"
    >
      <WidgetItem
        icon={HiSignal}
        descriptor={device.label ? device.tts_device_id : undefined}
      >
        {device.label ? device.label : device.tts_device_id}
      </WidgetItem>
    </Link>
  )
}
