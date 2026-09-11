import { serverUrl } from "../ServerUrl";
import { AuthorizationError } from "../authorization/AuthorizationError";
import { DeviceError } from "./DeviceError";
import type { DeviceConfigurationContract, DeviceConfigurationData } from "@road-citizen-inspector/contracts";

export const GetDeviceConfiguration = async (deviceId: number): Promise<DeviceConfigurationData> => {

    const response = await fetch(`${serverUrl()}/device/${deviceId}/config`, {
        credentials: 'include'
    })

    if (!response.ok) {
        if (response.status === 401)
            throw new AuthorizationError(
                `Failed to retrive device configuration. An active session is required.`,
            )
    }

    const { success, data } = (await response.json()) as DeviceConfigurationContract

    if (!success)
        throw new DeviceError('Failed to retrive device configuration. Please try again later.')

    return data
}