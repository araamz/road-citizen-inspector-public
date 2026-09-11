import { queryOptions } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { ServerError } from "@/data/api/ServerError";
import type { StatusError } from "@/data/api/status/StatusError";
import type { DeviceStatusData } from "@road-citizen-inspector/contracts";
import getLatestDeviceStatus from "@/data/api/status/GetLatestDeviceStatus";


export default function useLatestDeviceStatusOptions<TReturnValue = DeviceStatusData>(
    deviceId: number,
    options?: Partial<Omit<
        UseQueryOptions<
            DeviceStatusData,
            ServerError | StatusError,
            TReturnValue,
            [string, string, number]
        >,
        "queryKey" | "queryFn"
    >>
) {
    return queryOptions<
        DeviceStatusData,
        ServerError | StatusError,
        TReturnValue,
        [string, string, number]
    >({
        queryKey: ["status", "latest", deviceId],
        queryFn: ({ queryKey }) => getLatestDeviceStatus(queryKey[2]),
        ...options,
    });
}