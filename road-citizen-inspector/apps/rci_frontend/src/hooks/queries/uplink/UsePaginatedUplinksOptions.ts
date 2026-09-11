import {  queryOptions } from "@tanstack/react-query";
import type {UseQueryOptions} from "@tanstack/react-query";
import type { AuthorizationError, PermissionError } from "@/data/api/authorization/AuthorizationError";
import type { UplinkError } from "@/data/api/uplink/UplinkError";
import type { PaginatedUplinkData } from "@road-citizen-inspector/contracts";
import type { UplinkQuerySchema } from "@road-citizen-inspector/schemas";
import GetPaginatedUplinks from "@/data/api/uplink/GetPaginatedUplinks";

export default function usePaginatedUplinksOptions(
    query: UplinkQuerySchema,
    options?: UseQueryOptions<
        PaginatedUplinkData,
        AuthorizationError | PermissionError | UplinkError,
        PaginatedUplinkData,
        [string, string, string, UplinkQuerySchema]
    >
) {
    return queryOptions({
        queryKey: ['user', 'uplink', 'paginated', query],
        queryFn: async (q) => await GetPaginatedUplinks(q.queryKey[3]),
        ...options
    })
}