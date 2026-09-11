import {  queryOptions } from "@tanstack/react-query";
import type {UseQueryOptions} from "@tanstack/react-query";
import type { AuthorizationError, PermissionError } from "@/data/api/authorization/AuthorizationError";
import type { ServerError } from "@/data/api/ServerError";
import type { StatusError } from "@/data/api/status/StatusError";
import type { StatusData } from "@road-citizen-inspector/contracts";
import type { StatusQuerySchema } from "@road-citizen-inspector/schemas";
import getProjectStatus from "@/data/api/status/GetProjectStatus";

export default function useProjectStatusOptions(query: StatusQuerySchema, options?: Partial<UseQueryOptions<
    Array<StatusData>,
    AuthorizationError | PermissionError | ServerError | StatusError,
    Array<StatusData>,
    [string, string, string, StatusQuerySchema]
>>) {
    return queryOptions({
        queryKey: ['user', 'status', 'project', query],
        queryFn: async (q) => getProjectStatus(q.queryKey[3]),
        ...options
    })
} 