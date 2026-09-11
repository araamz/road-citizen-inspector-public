import {
  HiCog6Tooth,
  HiFolder,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2'
import { useNavigate } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import SectionLabel from '../../SectionLabel'
import SessionAction from './SessionAction'
import PinnedDeviceLink from './PinnedDeviceLink'
import type { MouseEvent } from 'react'
import type { DeviceData } from '@road-citizen-inspector/contracts'
import useAuthorization from '@/authorization/useAuthorization'
import useProjectDevicesOptions from '@/hooks/queries/device/UseProjectDevicesOptions'

// TODO: Fix Pinned Devices make it query
export default function CurrentSessionContainer() {
  const {
    session,
    role,
    removeAuthorization: { mutateAsync },
  } = useAuthorization()
  const navigate = useNavigate()

  const { data: pinnedDevices } = useQuery(
    useProjectDevicesOptions({
      select: (devices) => {
        return devices.filter((device) => device.is_pinned && !device.is_hidden)
      },
    }),
  )

  const handleEndSession = (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    event.preventDefault()

    const removeSession = mutateAsync().then(() =>
      navigate({
        to: '/',
      }),
    )

    toast.promise(removeSession, {
      loading: 'Ending session...',
      success: () => 'Successfully left session!',
      error: (error) => `Error occurred leaving session. ${error.message}`,
    })
  }

  const handleViewSession = (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    event.preventDefault()

    if (!session?.session_id) return
    navigate({
      to: '/session/$sessionId/project',
      params: {
        sessionId: String(session.session_id),
      },
    })
  }

  const handleViewSettings = (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    event.preventDefault()

    if (!session?.session_id) return
    navigate({
      to: '/session/$sessionId/settings',
      params: {
        sessionId: String(session.session_id),
      },
    })
  }

  if (!session) return undefined

  return (
    <article className="gap-10 flex flex-col max-w-[300px]">
      <div>
        <SectionLabel>Session Details</SectionLabel>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <p className="border-1 border-white/70 w-fit text-xs px-2 py-1 rounded-lg text-white/70">
              Session ID:{' '}
              <span className="font-semibold">{session.session_id}</span>
            </p>
            <h1 className="text-xl font-semibold text-white text-left">
              {session.title}
            </h1>
          </div>
          <p className="min-w-0 text-white/70 font-medium">
            {session.description}
          </p>
        </div>
      </div>
      {pinnedDevices && pinnedDevices.length > 0 ? (
        <div>
          <SectionLabel>Pinned Devices</SectionLabel>
          <div className="flex flex-col gap-4">
            {pinnedDevices.map((device: DeviceData) => (
              <PinnedDeviceLink key={device.device_id} device={device} />
            ))}
          </div>
        </div>
      ) : undefined}
      <div>
        <SectionLabel>Actions</SectionLabel>
        <div className="flex flex-col gap-4">
          <SessionAction
            icon={HiOutlineArrowRightOnRectangle}
            label="Leave Session"
            onClick={(event) => handleEndSession(event)}
          />
          <SessionAction
            onClick={(event) => handleViewSession(event)}
            icon={HiFolder}
            label="View Session"
          />
          {role === 'administrator' ? (
            <SessionAction
              icon={HiCog6Tooth}
              label="Session Settings"
              onClick={(event) => handleViewSettings(event)}
            />
          ) : undefined}
        </div>
      </div>
    </article>
  )
}
