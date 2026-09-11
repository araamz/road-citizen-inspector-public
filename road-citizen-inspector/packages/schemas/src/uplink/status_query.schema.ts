import type { TCDF_SENSOR_STATUS } from "@road-citizen-inspector/tcd-uplink-protocol";
import { z } from "zod";

const SENSOR_STATUS = [
    "ok",
    "error"
] as const satisfies readonly TCDF_SENSOR_STATUS[];

export const STATUS_QUERY_SCHEMA = z.object({
    device_ids: z
        .union([z.coerce.number(), z.array(z.coerce.number())])
        .transform((value) => (Array.isArray(value) ? value : [value]))
        .nullish(),
    sort_order: z.enum(["asc", "desc"]).nullish(),
    device_battery_level_minimum: z.coerce.number().min(0).max(100).nullish(),
    device_battery_level_maximum: z.coerce.number().min(0).max(100).nullish(),
    device_storage_level_minimum: z.coerce.number().min(0).max(100).nullish(),
    device_storage_level_maximum: z.coerce.number().min(0).max(100).nullish(),
    status_capture_time_start: z.coerce.date().nullish(),
    status_capture_time_end: z.coerce.date().nullish(),
    device_sensor_status: z.union([
        z.coerce.string(z.enum([...SENSOR_STATUS])),
        z.array(z.coerce.string(z.enum([...SENSOR_STATUS])))
    ]).transform((value) => (Array.isArray(value) ? value : [value])).nullish(),
    page: z.coerce.number().nullish(),
    size: z.coerce.number().nullish()
})

export type StatusQuerySchema = z.infer<typeof STATUS_QUERY_SCHEMA>;