import {  queryOptions } from "@tanstack/react-query";
import type {UseQueryOptions} from "@tanstack/react-query";
import type { AuthorizationError, PermissionError } from "@/data/api/authorization/AuthorizationError";
import type { ReadingError } from "@/data/api/reading/ReadingError";
import type { ServerError } from "@/data/api/ServerError";
import type { ReadingData } from "@road-citizen-inspector/contracts";
import type { ReadingQuerySchema } from "@road-citizen-inspector/schemas";
import getProjectReadings from "@/data/api/reading/GetProjectReadings";

export default function UseProjectReadingsOptions(
    query: ReadingQuerySchema,
    options?: Partial<UseQueryOptions<
        Array<ReadingData>,
        AuthorizationError | ServerError | PermissionError | ReadingError,
        Array<ReadingData>,
        [string, string, string, ReadingQuerySchema]
    >>
) {
    return queryOptions({
        queryKey: ['user','reading','project', query],
        queryFn: async (q) => getProjectReadings(q.queryKey[3]),
        ...options
    })
}