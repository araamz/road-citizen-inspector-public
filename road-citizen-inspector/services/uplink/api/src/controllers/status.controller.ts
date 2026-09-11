import { Hono } from "hono";
import { StatusService } from "../services/status.service.js";
import { zValidator } from "@hono/zod-validator";
import { NEW_STATUS_SCHEMA, STATUS_QUERY_SCHEMA } from "@road-citizen-inspector/schemas";
import { Context } from "hono";
import { DeviceStatusContract, PaginatedStatusContract, ProjectStatusContract, StatusContract, StatusData } from "@road-citizen-inspector/contracts";

export default function useStatusController(statusService: StatusService) {

    const statusController = new Hono()

    statusController.post("/", zValidator("json", NEW_STATUS_SCHEMA), async (ctx: Context) => {

        const {
            device_id,
            uplink_id,
            device_battery_level,
            device_storage_level,
            device_sensor_status,
            status_capture_time
        } = await ctx.req.json()

        const status = await statusService.createStatus(
            device_id,
            uplink_id,
            device_battery_level,
            device_storage_level,
            device_sensor_status,
            status_capture_time
        )

        return ctx.json<StatusContract>({
            success: true,
            message: "Successfully created status record.",
            data: {
                status_id: status.status_id,
                device_id: status.device_id,
                project_id: status.project_id,
                uplink_id: status.uplink_id,
                device_battery_level: status.device_battery_level,
                device_storage_level: status.device_storage_level,
                device_sensor_status: status.device_sensor_status,
                status_capture_time: status.status_capture_time,
                created_at: status.created_at
            }
        })

    })

    statusController.get("/project/:projectId", zValidator("query", STATUS_QUERY_SCHEMA), async (ctx) => {
        const projectId = Number(ctx.req.param("projectId"))

        const query = ctx.req.valid("query")

        const projectStatus = await statusService.getStatuses(projectId,
            {
                device_ids: query.device_ids ?? undefined,
                sort_order: query.sort_order ?? undefined,
                device_battery_level_minimum: query.device_battery_level_minimum ?? undefined,
                device_battery_level_maximum: query.device_battery_level_maximum ?? undefined,
                device_storage_level_minimum: query.device_storage_level_minimum ?? undefined,
                device_storage_level_maximum: query.device_storage_level_maximum ?? undefined,
                device_sensor_status: query.device_sensor_status ?? undefined,
                status_capture_time_start: query.status_capture_time_start ? query.status_capture_time_start : undefined,
                status_capture_time_end: query.status_capture_time_end ? query.status_capture_time_end : undefined
            },
        )

        return ctx.json<ProjectStatusContract>({
            success: true,
            message: "Successfully retrieved project status records.",
            data: projectStatus
        })
    })

    statusController.get("/project/:projectId/paginated", zValidator("query", STATUS_QUERY_SCHEMA), async (ctx) => {
        const projectId = Number(ctx.req.param("projectId"))

        const {
            page,
            size,
            ...query
        } = ctx.req.valid("query")

        const paginatedStatus = await statusService.getPaginatedStatus(
            projectId,
            {
                device_ids: query.device_ids ?? undefined,
                sort_order: query.sort_order ?? undefined,
                device_battery_level_minimum: query.device_battery_level_minimum ?? undefined,
                device_battery_level_maximum: query.device_battery_level_maximum ?? undefined,
                device_storage_level_minimum: query.device_storage_level_minimum ?? undefined,
                device_storage_level_maximum: query.device_storage_level_maximum ?? undefined,
                device_sensor_status: query.device_sensor_status ?? undefined,
                status_capture_time_start: query.status_capture_time_start ? query.status_capture_time_start : undefined,
                status_capture_time_end: query.status_capture_time_end ? query.status_capture_time_end : undefined
            },
            {
                page: page ?? 1,
                size: size ?? 10
            }
        )

        return ctx.json<PaginatedStatusContract>({
            success: true,
            message: "Successfully retrieved paginated status records.",
            data: paginatedStatus
        })
    })

    statusController.get("/device/:deviceId/latest", async (ctx) => {
        const deviceId = Number(ctx.req.param('deviceId'))

        const { status, errorSummary, device } = await statusService.getLatestDeviceStatus(deviceId)

        return ctx.json<DeviceStatusContract>({
            success: true,
            message: "Successfully retrieved latest device status.",
            data: {
                device: {
                    device_id: device.device_id,
                    tts_device_id: device.tts_device_id,
                    is_hidden: device.is_hidden,
                    is_pinned: device.is_pinned,
                    label: device.label,
                    description: device.description,
                    project_id: device.project_id,
                    origin_uplink_id: device.origin_uplink_id,
                    updated_at: device.updated_at,
                    created_at: device.created_at,
                    config_reading_id: device.config_reading_id
                },
                status: {
                    status_id: status.status_id,
                    uplink_id: status.uplink_id,
                    device_id: status.device_id,
                    project_id: status.project_id,
                    device_battery_level: status.device_battery_level,
                    device_storage_level: status.device_storage_level,
                    device_sensor_status: status.device_sensor_status,
                    status_capture_time: status.status_capture_time,
                    created_at: status.created_at
                },
                errorSummary
            }
        })

    })

    statusController.get("/project/:projectId/file", zValidator("query", STATUS_QUERY_SCHEMA), async (ctx) => {
        const projectId = Number(ctx.req.param("projectId"))

        const query = ctx.req.valid("query")

        const statusBytes = await statusService.createStatusFile(projectId,
            {
                device_ids: query.device_ids ?? undefined,
                sort_order: query.sort_order ?? undefined,
                device_battery_level_minimum: query.device_battery_level_minimum ?? undefined,
                device_battery_level_maximum: query.device_battery_level_maximum ?? undefined,
                device_storage_level_minimum: query.device_storage_level_minimum ?? undefined,
                device_storage_level_maximum: query.device_storage_level_maximum ?? undefined,
                device_sensor_status: query.device_sensor_status ?? undefined,
                status_capture_time_start: query.status_capture_time_start ? query.status_capture_time_start : undefined,
                status_capture_time_end: query.status_capture_time_end ? query.status_capture_time_end : undefined
            },
        )

        const fileBytesArray = new Uint8Array(statusBytes)

        ctx.header("Content-Type", "text/csv; charset=utf-8");
        ctx.header("Content-Disposition", `attachment; filename="status.csv"`);

        return ctx.body(fileBytesArray); 
    })

    return statusController;

}