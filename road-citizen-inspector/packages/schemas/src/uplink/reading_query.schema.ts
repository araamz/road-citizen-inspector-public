import { z } from "zod";
import type {
  TCDF_VEHICLE_TYPE,
  TCDF_DIRECTION_TYPE,
  TCDF_ROAD_TYPE,
} from "@road-citizen-inspector/tcd-uplink-protocol";

const VEHICLE_TYPES = [
  "car",
  "truck",
  "motorcycle",
  "unknown",
] as const satisfies readonly TCDF_VEHICLE_TYPE[];
const DIRECTIONS = [
  "north",
  "south",
  "east",
  "west",
  "northwest",
  "southwest",
  "northeast",
  "southeast",
] as const satisfies readonly TCDF_DIRECTION_TYPE[];
const ROAD_TYPES = [
  "sdsl",
  "sddl",
  "ddsl",
  "dddl",
] as const satisfies readonly TCDF_ROAD_TYPE[];

export const READING_QUERY_SCHEMA = z.object({
  device_ids: z
    .union([z.coerce.number(), z.array(z.coerce.number())])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .nullish(),
  vehicle_detection_time_start: z.coerce.date().nullish(),
  vehicle_detection_time_end: z.coerce.date().nullish(),
  sort_order: z.enum(["asc", "desc"]).nullish(),
  vehicle_speed_minimum: z.coerce.number().nullish(),
  vehicle_speed_maximum: z.coerce.number().nullish(),
  vehicle_types: z
    .union([
      z.string(z.enum([...VEHICLE_TYPES])),
      z.array(z.string(z.enum([...VEHICLE_TYPES]))),
    ])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .nullish(),
  vehicle_directions: z
    .union([
      z.string(z.enum([...DIRECTIONS])),
      z.array(z.string(z.enum([...DIRECTIONS]))),
    ])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .nullish(),
  vehicle_lanes: z
    .union([
      z.coerce
        .number()
        .min(1, "Lane can't be less than 1")
        .max(4, "Lane can't be greater than 4"),
      z.array(
        z.coerce
          .number()
          .min(1, "Lane can't be less than 1")
          .max(4, "Lane can't be greater than 4")
      ),
    ])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .nullish(),
  road_types: z
    .union([
      z.string(z.enum([...ROAD_TYPES])),
      z.array(z.string(z.enum([...ROAD_TYPES]))),
    ])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .nullish(),
  road_primary_directions: z
    .union([
      z.string(z.enum([...DIRECTIONS])),
      z.string(z.array(z.enum([...DIRECTIONS]))),
    ])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .nullish(),
  road_secondary_directions: z
    .union([
      z.string(z.enum([...DIRECTIONS])),
      z.array(z.string(z.enum([...DIRECTIONS]))),
    ])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .nullish(),
  page: z.coerce.number().nullish(),
  size: z.coerce.number().nullish(),
});

export type ReadingQuerySchema = z.infer<typeof READING_QUERY_SCHEMA>;
