import { queryOptions } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { AuthorizationError, PermissionError } from "@/data/api/authorization/AuthorizationError";
import type { UplinkError } from "@/data/api/uplink/UplinkError";
import type { UplinkData } from "@road-citizen-inspector/contracts";
import type { UplinkQuerySchema } from "@road-citizen-inspector/schemas";
import getProjectUplinks from "@/data/api/uplink/GetProjectUplinks";

export default function useProjectUplinkOptions(
    query: UplinkQuerySchema,
    options?: Omit<UseQueryOptions<
        Array<UplinkData>,
        AuthorizationError | PermissionError | UplinkError,
        Array<UplinkData>,
        [string, string, string, UplinkQuerySchema]
    >, "queryKey" | "queryFn">
) {
    return queryOptions({
        queryKey: ['user', 'uplink', 'project', query],
        queryFn: async (q) => await getProjectUplinks(q.queryKey[3]),
        ...options
    })
}