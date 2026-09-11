import { z } from "zod"

export const VISUALIZATION_QUERY_SCHEMA = z.object({
    visualizationStart: z.coerce.date(),
    visualizationEnd: z.coerce.date(),
    intervalDurationMinutes: z.coerce.number().min(1),
    includeData: z.coerce.boolean().optional()
})

export type VisualizationQuerySchema = z.infer<typeof VISUALIZATION_QUERY_SCHEMA>