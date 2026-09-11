import { serverUrl } from "../ServerUrl";
import { AuthorizationError, PermissionError } from "../authorization/AuthorizationError";
import { ServerError } from "../ServerError";
import { VisualizationError } from "./VisualizationError";
import type { DeviceSummaryVisualizationContract } from "@road-citizen-inspector/contracts";
import type { DeviceAbstractQuerySchema } from "@road-citizen-inspector/schemas";
import type { DeviceVisualizationData } from "@road-citizen-inspector/visualization";

export default async function getDevicePreviewVisualization(deviceId: number, queryParams: DeviceAbstractQuerySchema): Promise<DeviceVisualizationData> {
    const queryUrl = new URLSearchParams()

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value === null || (Array.isArray(value) && value.length === 0)) return;

        if (Array.isArray(value)) {
            value.forEach(item => queryUrl.append(key, String(item)));
        } else {
            queryUrl.set(key, String(value));
        }
    });

    const response = await fetch(`${serverUrl()}/visualization/device/${deviceId}/preview`, {
        credentials: 'include'
    })

    if (!response.ok) {
        if (response.status === 401) throw new AuthorizationError('An active session must be present to access this resource.');
        else if (response.status === 403) throw new PermissionError('Elevated permissions must be present to access this resource.');
        else throw new ServerError('An unexpected error occurred retrieving the visualization. Please try again later.');
    }

    const { success, data } = await (response.json()) as DeviceSummaryVisualizationContract

    if (!success) throw new VisualizationError('Error occurred getting device preview visualization. Data maybe malformed or unavailable.')

    return data;

}