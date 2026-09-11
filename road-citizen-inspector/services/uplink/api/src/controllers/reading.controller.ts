import { Context, Hono } from "hono";
import { ReadingService } from "../services/reading.service.js";
import { zValidator } from "@hono/zod-validator";
import { NEW_READING_SCHEMA, READING_QUERY_SCHEMA } from "@road-citizen-inspector/schemas";
import { ProjectReadingsContract, ReadingContract, ReadingPaginationContract } from "@road-citizen-inspector/contracts";

export default function useReadingController(readingService: ReadingService) {
  const readingController = new Hono();

  readingController.post(
    "/",
    zValidator("json", NEW_READING_SCHEMA),
    async (ctx: Context) => {
      const {
        device_id,
        uplink_id,
        vehicle_detection_time,
        vehicle_speed,
        vehicle_lane,
        vehicle_type,
        vehicle_direction,
        road_type,
        road_primary_direction,
        road_secondary_direction,
      } = await ctx.req.json();

      const createdReading = await readingService.createReading(
        device_id,
        uplink_id,
        vehicle_detection_time,
        vehicle_speed,
        vehicle_lane,
        vehicle_type,
        vehicle_direction,
        road_type,
        road_primary_direction,
        road_secondary_direction
      );

      return ctx.json<ReadingContract>({
        success: true,
        message: "Successfully created reading entry.",
        data: {
          reading_id: createdReading.reading_id,
          device_id: createdReading.device_id,
          project_id: createdReading.project_id,
          uplink_id: createdReading.uplink_id,
          vehicle_detection_time: createdReading.vehicle_detection_time,
          vehicle_speed: createdReading.vehicle_speed,
          vehicle_lane: createdReading.vehicle_lane,
          vehicle_type: createdReading.vehicle_type,
          vehicle_direction: createdReading.vehicle_direction,
          road_type: createdReading.road_type,
          road_primary_direction: createdReading.road_primary_direction,
          road_secondary_direction: createdReading.road_secondary_direction,
          created_at: createdReading.created_at
        }
      })

    }

  );

  readingController.get("/project/:projectId/paginated", zValidator("query", READING_QUERY_SCHEMA), async (ctx) => {
    const projectId = Number(ctx.req.param("projectId"));

    const q = await ctx.req.valid("query")
    const { page, size, ...rest } = q;

    console.log("Reading Query", {
      ...rest
    })

    const paginatedReadings = await readingService.getProjectReadingsPaginated(projectId, {
      page: page ?? 1,
      size: size ?? 10
    }, {
      device_ids: rest.device_ids ?? undefined,
      vehicle_detection_time_start: rest.vehicle_detection_time_start ? new Date(rest.vehicle_detection_time_start) : undefined,
      vehicle_detection_time_end: rest.vehicle_detection_time_end ? new Date(rest.vehicle_detection_time_end) : undefined,
      sort_order: rest.sort_order ?? undefined,
      vehicle_speed_minimum: rest.vehicle_speed_minimum ?? undefined,
      vehicle_speed_maximum: rest.vehicle_speed_maximum ?? undefined,
      vehicle_types: rest.vehicle_types ?? undefined,
      vehicle_directions: rest.vehicle_directions ?? undefined,
      vehicle_lanes: rest.vehicle_lanes ?? undefined,
      road_types: rest.road_types ?? undefined,
      road_primary_directions: rest.road_primary_directions ?? undefined,
      road_secondary_directions: rest.road_secondary_directions ?? undefined,
    })

    return ctx.json<ReadingPaginationContract>({
      message: "Successfully retrived paginated readings.",
      success: true,
      data: {
        entries: paginatedReadings.entries,
        page: paginatedReadings.page,
        size: paginatedReadings.size,
        count: paginatedReadings.count,
        pages: paginatedReadings.pages
      }
    })
  });

  readingController.get("/project/:projectId", zValidator("query", READING_QUERY_SCHEMA), async (ctx) => {

    const projectId = Number(ctx.req.param("projectId"))
    const query = ctx.req.valid("query")

    const projectReadings = await readingService.getProjectReadings(
      projectId,
      {
        device_ids: query.device_ids ?? undefined,
        vehicle_detection_time_start: query.vehicle_detection_time_start ? new Date(query.vehicle_detection_time_start) : undefined,
        vehicle_detection_time_end: query.vehicle_detection_time_end ? new Date(query.vehicle_detection_time_end) : undefined,
        sort_order: query.sort_order ?? undefined,
        vehicle_speed_minimum: query.vehicle_speed_minimum ?? undefined,
        vehicle_speed_maximum: query.vehicle_speed_maximum ?? undefined,
        vehicle_types: query.vehicle_types ?? undefined,
        vehicle_directions: query.vehicle_directions ?? undefined,
        vehicle_lanes: query.vehicle_lanes ?? undefined,
        road_types: query.road_types ?? undefined,
        road_primary_directions: query.road_primary_directions ?? undefined,
        road_secondary_directions: query.road_secondary_directions ?? undefined,
      }
    )

    return ctx.json<ProjectReadingsContract>({
      success: true,
      message: "Successfully retrived project readings.",
      data: projectReadings
    })

  })

  readingController.get("/project/:projectId/file", zValidator("query", READING_QUERY_SCHEMA), async (ctx) => {


    const projectId = Number(ctx.req.param("projectId"))
    const query = ctx.req.valid("query")

    const fileBytes = await readingService.createReadingFile(
      projectId,
      {
        device_ids: query.device_ids ?? undefined,
        vehicle_detection_time_start: query.vehicle_detection_time_start ? new Date(query.vehicle_detection_time_start) : undefined,
        vehicle_detection_time_end: query.vehicle_detection_time_end ? new Date(query.vehicle_detection_time_end) : undefined,
        sort_order: query.sort_order ?? undefined,
        vehicle_speed_minimum: query.vehicle_speed_minimum ?? undefined,
        vehicle_speed_maximum: query.vehicle_speed_maximum ?? undefined,
        vehicle_types: query.vehicle_types ?? undefined,
        vehicle_directions: query.vehicle_directions ?? undefined,
        vehicle_lanes: query.vehicle_lanes ?? undefined,
        road_types: query.road_types ?? undefined,
        road_primary_directions: query.road_primary_directions ?? undefined,
        road_secondary_directions: query.road_secondary_directions ?? undefined,
      }
    )

    const fileBytesArray = new Uint8Array(fileBytes)

    ctx.header("Content-Type", "text/csv; charset=utf-8");
    ctx.header("Content-Disposition", `attachment; filename="readings.csv"`);

    return ctx.body(fileBytesArray);

  })

  return readingController;
}
