import {  queryOptions } from "@tanstack/react-query";
import type {UseSuspenseQueryOptions} from "@tanstack/react-query";
import type { AuthorizationError } from "@/data/api/authorization/AuthorizationError";
import type { ServerError } from "@/data/api/ServerError";
import type { VisualizationError } from "@/data/api/visualization/VisualizationError";
import type { DeviceAbstractQuerySchema } from "@road-citizen-inspector/schemas";
import type { DeviceVisualizationData } from "@road-citizen-inspector/visualization";
import getDeviceVisualization from "@/data/api/visualization/GetDeviceVisualization";

export default function UseDeviceVisualizationSuspenseOptions(
    deviceId: number, 
    query: DeviceAbstractQuerySchema,
    options?: Partial<UseSuspenseQueryOptions<
    DeviceVisualizationData,
    AuthorizationError | ServerError | VisualizationError,
    DeviceVisualizationData,
    [string, string, number, DeviceAbstractQuerySchema]
>>) {
    return queryOptions({
        queryKey: ['user', 'visualization', deviceId, query],
        queryFn: async (q) => getDeviceVisualization(q.queryKey[2], q.queryKey[3]),
        ...options
    })
}