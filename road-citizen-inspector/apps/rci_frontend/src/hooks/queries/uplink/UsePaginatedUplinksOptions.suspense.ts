import {  queryOptions } from "@tanstack/react-query";
import type {UseSuspenseQueryOptions} from "@tanstack/react-query";
import type { AuthorizationError, PermissionError } from "@/data/api/authorization/AuthorizationError";
import type { UplinkError } from "@/data/api/uplink/UplinkError";
import type { PaginatedUplinkData } from "@road-citizen-inspector/contracts";
import type { UplinkQuerySchema } from "@road-citizen-inspector/schemas";
import GetPaginatedUplinks from "@/data/api/uplink/GetPaginatedUplinks";

export default function usePaginatedUplinksSuspenseOptions(
    query: UplinkQuerySchema,
    options?: UseSuspenseQueryOptions<
        PaginatedUplinkData,
        AuthorizationError | PermissionError | UplinkError,
        PaginatedUplinkData,
        [string, string, UplinkQuerySchema]
    >
) {
    return queryOptions({
        queryKey: ['user', 'uplink', query],
        queryFn: async () => await GetPaginatedUplinks(query),
        ...options
    })
}