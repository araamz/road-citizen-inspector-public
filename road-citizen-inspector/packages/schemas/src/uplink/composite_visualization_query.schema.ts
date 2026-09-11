import { z } from "zod";
import { READING_QUERY_SCHEMA } from "./reading_query.schema.js";
import { VISUALIZATION_QUERY_SCHEMA } from "../visualization_query.schema.js";

export const COMPOSITE_VISUALIZATION_QUERY_SCHEMA = VISUALIZATION_QUERY_SCHEMA.merge(
READING_QUERY_SCHEMA.omit({
        page: true,
        size: true,
        sort_order: true,
        vehicle_detection_time_start: true,
        vehicle_detection_time_end: true,
    })
)

export type CompositeVisualizationQuerySchema = z.infer<typeof COMPOSITE_VISUALIZATION_QUERY_SCHEMA>;