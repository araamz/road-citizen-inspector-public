import {  queryOptions } from "@tanstack/react-query";
import type {UseQueryOptions} from "@tanstack/react-query";
import type { AuthorizationError, PermissionError } from "@/data/api/authorization/AuthorizationError";
import type { ReadingError } from "@/data/api/reading/ReadingError";
import type { ServerError } from "@/data/api/ServerError";
import type { PagiantedReadingData } from "@road-citizen-inspector/contracts";
import type { ReadingQuerySchema } from "@road-citizen-inspector/schemas";
import getPaginatedReadings from "@/data/api/reading/GetPaginatedReadings";

export default function usePaginatedReadingsOptions(
    query: ReadingQuerySchema,
    options?: Partial<UseQueryOptions<
        PagiantedReadingData,
        AuthorizationError | ServerError | PermissionError | ReadingError,
        PagiantedReadingData,
        [string, string, string, ReadingQuerySchema]
    >>
) {
    return queryOptions({
        queryKey: ['user', 'reading', 'paginated', query],
        queryFn: async (q) => await getPaginatedReadings(q.queryKey[3]),
        ...options
    })
}