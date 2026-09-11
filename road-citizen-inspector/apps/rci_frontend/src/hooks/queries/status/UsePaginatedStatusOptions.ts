import {  queryOptions } from "@tanstack/react-query";
import type {UseQueryOptions} from "@tanstack/react-query";
import type { AuthorizationError, PermissionError } from "@/data/api/authorization/AuthorizationError";
import type { ServerError } from "@/data/api/ServerError";
import type { StatusError } from "@/data/api/status/StatusError";
import type { PaginatedStatusData } from "@road-citizen-inspector/contracts";
import type { StatusQuerySchema } from "@road-citizen-inspector/schemas";
import getPaginatedStatus from "@/data/api/status/GetPaginatedStatus";

export default function UsePaginatedStatusOptions(query: StatusQuerySchema, options?: Partial<UseQueryOptions<
    PaginatedStatusData,
    AuthorizationError | PermissionError | ServerError | StatusError,
    PaginatedStatusData,
    [string, string, string, StatusQuerySchema]
>>) {
    return queryOptions({
        queryKey: ['user', 'status', 'paginated', query],
        queryFn: async (q) => getPaginatedStatus(q.queryKey[3]),
        ...options
    })
} 