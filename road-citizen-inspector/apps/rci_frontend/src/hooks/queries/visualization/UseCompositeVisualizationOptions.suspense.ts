import { queryOptions } from "@tanstack/react-query";
import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import type { AuthorizationError } from "@/data/api/authorization/AuthorizationError";
import type { ServerError } from "@/data/api/ServerError";
import type { VisualizationError } from "@/data/api/visualization/VisualizationError";
import type { CompositeVisualizationQuerySchema } from "@road-citizen-inspector/schemas";
import type { CompositeVisualizationData } from "@road-citizen-inspector/visualization";
import getCompositeVisualization from "@/data/api/visualization/GetCompositeVisualization";

export default function UseCompositeVisualizationSuspenseOptions(query: CompositeVisualizationQuerySchema, options?: Partial<UseSuspenseQueryOptions<
    CompositeVisualizationData,
    AuthorizationError | ServerError | VisualizationError,
    CompositeVisualizationData,
    [string, string, CompositeVisualizationQuerySchema]
>>) {
    return queryOptions({
        queryKey: ['user', 'visualization', query],
        queryFn: async (q) => getCompositeVisualization(q.queryKey[2]),
        ...options
    })
}