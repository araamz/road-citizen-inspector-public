import { serverUrl } from '../ServerUrl'
import { AuthorizationError } from '../authorization/AuthorizationError'
import { DeviceError } from './DeviceError'
import type {
  ContractError,
    DeviceContract,
  DeviceData,
} from '@road-citizen-inspector/contracts'

export const getDevice = async (deviceId: number): Promise<DeviceData> => {
  const response = await fetch(`${serverUrl()}/device/${deviceId}`, {
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 401) throw new AuthorizationError(`Failed to retrive device. An active session is required.`)
    else if (response.status === 403) throw new AuthorizationError("Failed to retrive device. Elevated permissions are required for this resource.")
  }

  const {success, data } = (await response.json()) as DeviceContract;

  if (!success) {
    const {error} = (await response.json()) as ContractError<{
      name: string;
      details: any;
    }>
    if (error.name == "DEVICE_NOT_FOUND_ERROR") {
      throw new DeviceError("Failed to retrive device. Device was not found.")
    }

    throw new DeviceError("Failed to retrive device. Please try again later.")
  }

  return data
  
}