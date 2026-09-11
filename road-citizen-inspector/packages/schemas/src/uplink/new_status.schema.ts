import { z } from "zod"

const NEW_STATUS_SCHEMA = z.object({
    device_id: z.number(),
    uplink_id: z.number(),
    device_battery_level: z.number(),
    device_storage_level: z.number(),
    device_sensor_status: z.string(),
    status_capture_time: z.string()
})

export { NEW_STATUS_SCHEMA }
export type NewStatusSchema = z.infer<typeof NEW_STATUS_SCHEMA>;