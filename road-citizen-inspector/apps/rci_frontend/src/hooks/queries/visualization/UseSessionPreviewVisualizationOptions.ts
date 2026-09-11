import {  queryOptions } from "@tanstack/react-query";
import type {UseQueryOptions} from "@tanstack/react-query";
import type { AuthorizationError } from "@/data/api/authorization/AuthorizationError";
import type { ServerError } from "@/data/api/ServerError";
import type { VisualizationError } from "@/data/api/visualization/VisualizationError";
import type { SessionPreviewData, SessionPreviewQuery } from "@road-citizen-inspector/visualization";
import getSessionPreviewVisualization from "@/data/api/visualization/GetSessionPreviewVisualization";

export default function UseSessionPreviewVisualizationOptions(
    sessionId: number, 
    query: SessionPreviewQuery,
    options?: Partial<UseQueryOptions<
        SessionPreviewData,
        AuthorizationError | ServerError | VisualizationError,
        SessionPreviewData,
        [string, string, string, number]
    >>
) {
    return queryOptions({
        queryKey: ['user', 'visualization', 'session_preview', sessionId],
        queryFn: async (q) => getSessionPreviewVisualization(q.queryKey[3], query),
        ...options
    })
}