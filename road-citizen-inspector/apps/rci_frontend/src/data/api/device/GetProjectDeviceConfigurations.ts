import { GetDeviceConfiguration } from "./GetDeviceConfiguration";
import type { DeviceConfigurationData } from "@road-citizen-inspector/contracts";

// TODO: FIX THIS (3/20)
export const getProjectDeviceConfigurations = async (deviceIds: Array<number>): Promise<Array<DeviceConfigurationData>> => {
    return Promise.all(
        deviceIds.map((id) => GetDeviceConfiguration(id))
    ).then((d) => {
        return d
    })
}