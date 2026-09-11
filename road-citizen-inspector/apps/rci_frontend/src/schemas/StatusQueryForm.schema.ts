import { z } from "zod";

export const STATUS_QUEERY_FORM_SCHEMA = z.object({
    device_ids: z.array(z.coerce.number()).nullish(),
    sort_order: z.enum(["asc", "desc"]).nullish(),
    device_battery_level_minimum: z.coerce.number().min(0).max(100).nullish(),
    device_battery_level_maximum: z.coerce.number().min(0).max(100).nullish(),
    device_storage_level_minimum: z.coerce.number().min(0).max(100).nullish(),
    device_storage_level_maximum: z.coerce.number().min(0).max(100).nullish(),
    status_capture_time_start: z.coerce.date().nullish(),
    status_capture_time_end: z.coerce.date().nullish(),
    device_sensor_status: z.array(z.string()).nullish(),
    page: z.coerce.number().nullish(),
    size: z.coerce.number().nullish(),
})

export type StatusQueryFormSchema = z.infer<typeof STATUS_QUEERY_FORM_SCHEMA>;