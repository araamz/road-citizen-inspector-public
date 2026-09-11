import { AuthorizationError, PermissionError } from '../authorization/AuthorizationError'
import { serverUrl } from '../ServerUrl'
import { DeviceError } from './DeviceError'
import type {
    DeviceContract,
    DeviceData,
} from '@road-citizen-inspector/contracts'
import type { UpdatedDeviceSchema } from '@road-citizen-inspector/schemas'

export type PatchDeviceParams = {
    deviceId: number,
    patch: UpdatedDeviceSchema
}
const patchDevice = async (patchParams: PatchDeviceParams): Promise<DeviceData> => {
    const response = await fetch(`${serverUrl()}/device/${patchParams.deviceId}`, {
        method: 'PATCH',
        body: JSON.stringify(patchParams.patch),
        credentials: 'include',
    })

    if (!response.ok) {
        if (response.status === 403) {
            throw new PermissionError(
                'Session does not meet proper permissions to make changes.',
            )
        } else if (response.status === 401) {
            throw new AuthorizationError(
                'Session is required to make changes to device. Please try again.',
            )
        }
    }
    const { success, data } = (await response.json()) as DeviceContract
    if (!success)
        throw new DeviceError(
            'An unexpected error occurred updating device. Please try again.',
        )
    return data
}

export { patchDevice }