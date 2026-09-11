import { serverUrl } from '../ServerUrl'
import { AuthorizationError } from '../authorization/AuthorizationError'
import { DeviceError } from './DeviceError'
import type {
  DeviceData,
  DevicesContract,
} from '@road-citizen-inspector/contracts'

export const getProjectDevices = async (): Promise<Array<DeviceData>> => {
  const response = await fetch(`${serverUrl()}/device`, {
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401)
      throw new AuthorizationError(
        `Failed to retrive devices. An active session is required.`,
      )
    else if (response.status === 403)
      throw new AuthorizationError(
        'Failed to retrive devices. Elevated permissions are required for this resource.',
      )
  }

  const { success, data } = (await response.json()) as DevicesContract
  if (!success)
    throw new DeviceError('Failed to retrive devices. Please try again later.')

  return data
}
