import {  queryOptions } from "@tanstack/react-query";
import type {QueryOptions} from "@tanstack/react-query";
import type { AuthorizationError } from "@/data/api/authorization/AuthorizationError";
import type { ServerError } from "@/data/api/ServerError";
import type { VisualizationError } from "@/data/api/visualization/VisualizationError";
import type { DeviceAbstractQuerySchema } from "@road-citizen-inspector/schemas";
import type { DevicePreviewVisualizationData } from "@road-citizen-inspector/visualization";
import getDeviceVisualization from "@/data/api/visualization/GetDeviceVisualization";

export default function UseDevicePreviewVisualizationOptions(
    deviceId: number, 
    query: DeviceAbstractQuerySchema,
    options?: Partial<QueryOptions<
    DevicePreviewVisualizationData,
    AuthorizationError | ServerError | VisualizationError,
    DevicePreviewVisualizationData,
    [string, string, string, number, DeviceAbstractQuerySchema]
>>) {
    return queryOptions({
        queryKey: ['user', 'visualization', 'preview', deviceId, query],
        queryFn: async (q) => getDeviceVisualization(q.queryKey[3], q.queryKey[4]),
        ...options
    })
}