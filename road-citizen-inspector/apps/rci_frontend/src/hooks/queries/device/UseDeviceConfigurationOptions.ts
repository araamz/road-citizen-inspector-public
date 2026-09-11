import {  queryOptions } from "@tanstack/react-query";
import type {UseQueryOptions} from "@tanstack/react-query";
import type { AuthorizationError } from "@/data/api/authorization/AuthorizationError";
import type { DeviceError } from "@/data/api/device/DeviceError";
import type { DeviceConfigurationData } from "@road-citizen-inspector/contracts";
import { GetDeviceConfiguration } from "@/data/api/device/GetDeviceConfiguration";

export default function useDeviceConfigurationOptions(
    deviceId: number, options?: Partial<UseQueryOptions<
        DeviceConfigurationData,
        AuthorizationError | DeviceError,
        DeviceConfigurationData,
        [string, string, string, number]
    >>) {
    return queryOptions({
        queryKey: ['user', 'device', 'config', deviceId],
        queryFn: async (q) => GetDeviceConfiguration(q.queryKey[3]),
        ...options
    })
}