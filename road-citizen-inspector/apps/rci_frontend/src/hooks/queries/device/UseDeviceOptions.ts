import {  queryOptions } from "@tanstack/react-query";
import type {UseQueryOptions} from "@tanstack/react-query";
import type { AuthorizationError } from "@/data/api/authorization/AuthorizationError";
import type { DeviceError } from "@/data/api/device/DeviceError";
import type { DeviceData } from "@road-citizen-inspector/contracts";
import { getDevice } from "@/data/api/device/GetDevice";

export default function useDeviceOptions(deviceId: number, options?: Partial<UseQueryOptions<
    DeviceData,
    AuthorizationError | DeviceError,
    DeviceData,
    [string, string, number]
>>) {
    return queryOptions({
        queryKey: ['user', 'device', deviceId],
        queryFn: async (q) => getDevice(q.queryKey[2]),
        ...options
    })
}