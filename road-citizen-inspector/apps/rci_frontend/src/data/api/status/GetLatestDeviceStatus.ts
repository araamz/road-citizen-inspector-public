import { AuthorizationError, PermissionError } from "../authorization/AuthorizationError";
import { ServerError } from "../ServerError";
import { serverUrl } from "../ServerUrl";
import { StatusError } from "./StatusError";
import type { DeviceStatusContract, DeviceStatusData } from "@road-citizen-inspector/contracts";

export default async function getLatestDeviceStatus(deviceId: number): Promise<DeviceStatusData> {

    const response = await fetch(`${serverUrl()}/status/device/${deviceId}/latest`, {
        credentials: 'include'
    })

    if (!response.ok) {
        if (response.status === 401) throw new AuthorizationError('An active session must be present to access this resource.');
        else if (response.status === 403) throw new PermissionError('Elevated permissions must be present to access this resource.');
        else throw new ServerError('An unexpected error occurred retrieving the visualization. Please try again later.');
    }

    const { success, data } = await (response.json()) as DeviceStatusContract

    if (!success) throw new StatusError('Error occurred getting latest device status. Status may not be available or awaiting.')

    return data;

}