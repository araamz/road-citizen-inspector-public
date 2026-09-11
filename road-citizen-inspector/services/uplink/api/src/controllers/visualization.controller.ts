import { Hono } from "hono";
import { logger } from "hono/logger";
import { VisualizationService } from "../services/visualization.service.js";
import { zValidator } from "@hono/zod-validator";
import { COMPOSITE_VISUALIZATION_QUERY_SCHEMA, DEVICE_ABSTRACT_QUERY_SCHEMA } from "@road-citizen-inspector/schemas";
import { CompositeVisualizationContract, DevicePreviewVisualizationContract, DeviceSummaryVisualizationContract, SessionPreviewContract } from "@road-citizen-inspector/contracts";

export default function useVisualizationController(visualizationService: VisualizationService) {

    const visualizationController = new Hono()

    visualizationController.use(logger())

    visualizationController.get("/project/:projectId/composite", zValidator("query", COMPOSITE_VISUALIZATION_QUERY_SCHEMA), async (ctx) => {

        const projectId = Number(ctx.req.param("projectId"));
        const { visualizationStart, visualizationEnd, intervalDurationMinutes, includeData, ...query } = ctx.req.valid("query");

        const visualizationData = await visualizationService.generateCompositeData(projectId, includeData, {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
            vehicle_speed_minimum: query.vehicle_speed_minimum ?? undefined,
            vehicle_speed_maximum: query.vehicle_speed_maximum ?? undefined,
            vehicle_types: query.vehicle_types ?? undefined,
            vehicle_directions: query.vehicle_directions ?? undefined,
            vehicle_lanes: query.vehicle_lanes ?? undefined,
            device_ids: query.device_ids ?? undefined,
            road_types: query.road_types ?? undefined,
            road_primary_directions: query.road_primary_directions ?? undefined,
            road_secondary_directions: query.road_secondary_directions ?? undefined,
        })

        return ctx.json<CompositeVisualizationContract>({
            success: true,
            message: "Composite visualization data retrieved successfully.",
            data: visualizationData
        })
    })

    // Since the query functionality is mostly the same - reusing COMPOSITE_VISUALIZATION_QUERY_SCHEMA
    visualizationController.get("/session/:sessionId/preview", zValidator("query", COMPOSITE_VISUALIZATION_QUERY_SCHEMA), async (ctx) => {
        const sessionId = Number(ctx.req.param("sessionId"))
        const {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
            includeData,
            ...query
        } = ctx.req.valid("query")


        const visualizationData = await visualizationService.generateSessionPreview(sessionId, includeData, {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
            vehicle_speed_minimum: query.vehicle_speed_minimum ?? undefined,
            vehicle_speed_maximum: query.vehicle_speed_maximum ?? undefined,
            vehicle_types: query.vehicle_types ?? undefined,
            vehicle_directions: query.vehicle_directions ?? undefined,
            vehicle_lanes: query.vehicle_lanes ?? undefined,
            device_ids: query.device_ids ?? undefined,
            road_types: query.road_types ?? undefined,
            road_primary_directions: query.road_primary_directions ?? undefined,
            road_secondary_directions: query.road_secondary_directions ?? undefined,
        })

        return ctx.json<SessionPreviewContract>({
            success: true,
            message: "Session preview visualization data retrieved successfully",
            data: visualizationData
        })
    })

    visualizationController.get("/device/:deviceId/summary", zValidator("query", DEVICE_ABSTRACT_QUERY_SCHEMA), async (ctx) => {

        const deviceId = Number(ctx.req.param("deviceId"))
        const {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
            includeData,
            ...query
        } = ctx.req.valid("query")

        const visualizationData = await visualizationService.generateDeviceData(deviceId, includeData, {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
            reading: {
                vehicle_speed_minimum: query.vehicle_speed_minimum ?? undefined,
                vehicle_speed_maximum: query.vehicle_speed_maximum ?? undefined,
                vehicle_types: query.vehicle_types ?? undefined,
                vehicle_directions: query.vehicle_directions ?? undefined,
                vehicle_lanes: query.vehicle_lanes ?? undefined,
                road_types: query.road_types ?? undefined,
                road_primary_directions: query.road_primary_directions ?? undefined,
                road_secondary_directions: query.road_secondary_directions ?? undefined,
            },
            status: {
                device_battery_level_minimum: query.device_battery_level_minimum ?? undefined,
                device_battery_level_maximum: query.device_battery_level_maximum ?? undefined,
                device_storage_level_minimum: query.device_storage_level_minimum ?? undefined,
                device_storage_level_maximum: query.device_storage_level_maximum ?? undefined,
                device_sensor_status: query.device_sensor_status ?? undefined
            }
        })

        return ctx.json<DeviceSummaryVisualizationContract>({
            success: true,
            message: "Device visualization data retrieved successfully.",
            data: visualizationData
        })

    })

    visualizationController.get("/device/:deviceId/preview", zValidator("query", DEVICE_ABSTRACT_QUERY_SCHEMA), async (ctx) => {
        const deviceId = Number(ctx.req.param("deviceId"))
        const {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
            includeData,
            ...query
        } = ctx.req.valid("query")

        const visualizationData = await visualizationService.generateDeviceData(deviceId, includeData, {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
            reading: {
                vehicle_speed_minimum: query.vehicle_speed_minimum ?? undefined,
                vehicle_speed_maximum: query.vehicle_speed_maximum ?? undefined,
                vehicle_types: query.vehicle_types ?? undefined,
                vehicle_directions: query.vehicle_directions ?? undefined,
                vehicle_lanes: query.vehicle_lanes ?? undefined,
                road_types: query.road_types ?? undefined,
                road_primary_directions: query.road_primary_directions ?? undefined,
                road_secondary_directions: query.road_secondary_directions ?? undefined,
            },
            status: {
                device_battery_level_minimum: query.device_battery_level_minimum ?? undefined,
                device_battery_level_maximum: query.device_battery_level_maximum ?? undefined,
                device_storage_level_minimum: query.device_storage_level_minimum ?? undefined,
                device_storage_level_maximum: query.device_storage_level_maximum ?? undefined,
                device_sensor_status: query.device_sensor_status ?? undefined
            }
        })

        return ctx.json<DevicePreviewVisualizationContract>({
            success: true,
            message: "Device preview visualization data retrieved successfully.",
            data: visualizationData
        })
    })

    return visualizationController;

}