import { z } from "zod"

const NEW_READING_SCHEMA = z.object({
    device_id: z.number(),
    uplink_id: z.number(),
    vehicle_detection_time: z.string(),
    vehicle_speed: z.number(),
    vehicle_lane: z.number(),
    vehicle_type: z.string().optional(),
    vehicle_direction: z.string().optional(),
    road_type: z.string(),
    road_primary_direction: z.string(),
    road_secondary_direction: z.string()
})

export { NEW_READING_SCHEMA }
export type NewRedaingSchema = z.infer<typeof NEW_READING_SCHEMA>