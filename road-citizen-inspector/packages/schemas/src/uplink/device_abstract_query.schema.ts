import { z } from "zod"
import { VISUALIZATION_QUERY_SCHEMA } from "../visualization_query.schema.js"
import { READING_QUERY_SCHEMA } from "./reading_query.schema.js"
import { STATUS_QUERY_SCHEMA } from "./status_query.schema.js"

const BASE_READING_QUERY = READING_QUERY_SCHEMA.omit({
    page: true,
    size: true,
    vehicle_detection_time_start: true,
    vehicle_detection_time_end: true,
    sort_order: true,
    device_ids: true
})

const BASE_STATUS_QUERY = STATUS_QUERY_SCHEMA.omit({
    page: true,
    size: true,
    status_capture_time_start: true,
    status_capture_time_end: true,
    sort_order: true,
    device_ids: true
})

const DEVICE_ABSTRACT_BASE_QUERY_SCHEMA = BASE_READING_QUERY.merge(BASE_STATUS_QUERY)

export const DEVICE_ABSTRACT_QUERY_SCHEMA = VISUALIZATION_QUERY_SCHEMA.merge(DEVICE_ABSTRACT_BASE_QUERY_SCHEMA)
export type DeviceAbstractQuerySchema = z.infer<typeof DEVICE_ABSTRACT_QUERY_SCHEMA>