import {  queryOptions} from "@tanstack/react-query";
import type {UseQueryOptions} from "@tanstack/react-query";
import type { AuthorizationError } from "@/data/api/authorization/AuthorizationError";
import type { DeviceError } from "@/data/api/device/DeviceError";
import type { DeviceData } from "@road-citizen-inspector/contracts";
import { getProjectDevices } from "@/data/api/device/GetProjectDevices";

export default function useProjectDevicesOptions<ReturnValue = DeviceData>(
    options?: Partial<UseQueryOptions<
        Array<DeviceData>,
        DeviceError | AuthorizationError,
        Array<ReturnValue>,
        [string, string]
    >>
) {
    return queryOptions({
        queryKey: ['user', 'device'],
        queryFn: async () => await getProjectDevices(),
        ...options
    })
}