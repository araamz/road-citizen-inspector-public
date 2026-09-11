import {  queryOptions } from "@tanstack/react-query";
import type {UseQueryOptions} from "@tanstack/react-query";
import type { AuthorizationError } from "@/data/api/authorization/AuthorizationError";
import type { DeviceError } from "@/data/api/device/DeviceError";
import type { DeviceConfigurationData } from "@road-citizen-inspector/contracts";
import { getProjectDeviceConfigurations } from "@/data/api/device/GetProjectDeviceConfigurations";

export default function useProjectDeviceConfigurations<TReturnValue = DeviceConfigurationData>(deviceIds: Array<number>, options?: Partial<UseQueryOptions<
    Array<DeviceConfigurationData>,
    AuthorizationError | DeviceError,
    Array<TReturnValue>,
    [string, string, Array<number>]
>>) {
    return queryOptions({
        queryKey: ['user', 'device', deviceIds],
        queryFn: async (q) => getProjectDeviceConfigurations(q.queryKey[2]),
        ...options
    })
}