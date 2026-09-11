import { z } from "zod"

export const READING_QUERY_FORM_SCHEMA = z.object({
    device_ids: z.array(z.coerce.number()).nullish(),
    vehicle_detection_time_start: z.coerce.date().nullish(),
    vehicle_detection_time_end: z.coerce.date().nullish(),
    sort_order: z.enum(['asc', 'desc']).nullish(),
    vehicle_speed_minimum: z.coerce.number().nullish(),
    vehicle_speed_maximum: z.coerce.number().nullish(),
    vehicle_types: z.array(z.string()).nullish(),
    vehicle_directions: z.array(z.string()).nullish(),
    vehicle_lanes: z.array(z.coerce.number()).nullish(),
    road_types: z.array(z.string()).nullish(),
    road_primary_directions: z.array(z.string()).nullish(),
    road_secondary_directions: z.array(z.string()).nullish(),
    page: z.coerce.number().nullish(),
    size: z.coerce.number().nullish(),
})
export type ReadingQueryFormSchema = z.infer<typeof READING_QUERY_FORM_SCHEMA>;