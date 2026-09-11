import { Context, Hono } from "hono";
import { UplinkService } from "../services/uplink.service.js";
import {
  ProjectContract,
  ProjectUplinksContract,
  UplinkContract,
  UplinkPaginationContract,
} from "@road-citizen-inspector/contracts";
import { zValidator } from "@hono/zod-validator";
import { UPDATED_UPLINK_SCHEMA, UPLINK_QUERY_SCHEMA } from "@road-citizen-inspector/schemas";
import { logger } from "hono/logger";
import { DEVICE_COMPOSITE_SCHEMA } from "@road-citizen-inspector/schemas";

export default function useUplinkController(uplinkService: UplinkService) {
  const uplinkController = new Hono();

  uplinkController.use(logger())

  uplinkController.post("/", async (ctx: Context) => {
    const webhookKey = ctx.req.header()["x-webhook-key"];

    const uplinkBody = await ctx.req.json();
    const appId = uplinkBody.uplink_message.application_ids.application_id;
    const devId = uplinkBody.uplink_message.device_id;
    const uplinkPayload = uplinkBody.uplink_message.frm_payload;
    const createdUplink = await uplinkService.createUplink(
      webhookKey,
      appId,
      devId,
      uplinkBody,
      uplinkPayload,
    );


    return ctx.json<UplinkContract>({
      success: true,
      message: "Successfully captured uplink.",
      data: {
        uplink_id: createdUplink.uplink_id,
        project_id: createdUplink.project_id,
        tts_device_id: createdUplink.tts_device_id,
        raw_payload: createdUplink.raw_payload,
        status: createdUplink.status,
        created_at: createdUplink.created_at,
        updated_at: createdUplink.updated_at,
      },
    });
  });


  uplinkController.get("/:uplinkId", async (ctx: Context) => {
    const uplinkId = Number(ctx.req.param("uplinkId"));

    const foundUplink = await uplinkService.getUplink(uplinkId);

    return ctx.json<UplinkContract>({
      success: true,
      message: "Successfully retrieved uplink.",
      data: {
        uplink_id: foundUplink.uplink_id,
        project_id: foundUplink.project_id,
        tts_device_id: foundUplink.tts_device_id,
        raw_payload: foundUplink.raw_payload,
        status: foundUplink.status,
        created_at: foundUplink.created_at,
        updated_at: foundUplink.updated_at,
      },
    });
  });

  uplinkController.patch(
    "/:uplinkId",
    zValidator("json", UPDATED_UPLINK_SCHEMA),
    async (ctx) => {
      const uplinkId = Number(ctx.req.param("uplinkId"));
      const { status } = await ctx.req.valid("json");

      console.log("Updating uplink", uplinkId, "to status", status);

      const updatedUplink = await uplinkService.updateUplinkStatus(
        uplinkId,
        status,
      )

      return ctx.json<UplinkContract>({
        success: true,
        message: "Successfully updated uplink status.",
        data: {
          uplink_id: updatedUplink.uplink_id,
          project_id: updatedUplink.project_id,
          tts_device_id: updatedUplink.tts_device_id,
          raw_payload: updatedUplink.raw_payload,
          status: updatedUplink.status,
          created_at: updatedUplink.created_at,
          updated_at: updatedUplink.updated_at,
        },
      });
    },
  );

  uplinkController.get("/project/:projectId/paginated", zValidator("query", UPLINK_QUERY_SCHEMA), async (ctx) => {
    const projectId = Number(ctx.req.param("projectId"));
    const query = await ctx.req.valid("query");

    const page = Number(query.page);
    const size = Number(query.size);

    const projectUplinks = await uplinkService.getPaginatedUplinks(
      projectId,
      {
        created_at_start: query.created_at_start ? new Date(query.created_at_start) : undefined,
        created_at_end: query.created_at_end ? new Date(query.created_at_end) : undefined,
        updated_at_start: query.updated_at_start ? new Date(query.updated_at_start) : undefined,
        updated_at_end: query.updated_at_end ? new Date(query.updated_at_end) : undefined,
        sort_order: query.sort_order ?? 'desc',
        processed: query.processed ?? false,
        unprocessed: query.unprocessed ?? false,
        failed: query.failed ?? false,
      },
      {
        page: page || 1,
        size: size || 10,
      }
    );

    return ctx.json<UplinkPaginationContract>({
      success: true,
      data: {
        entries: projectUplinks.entries.map((uplink) => ({
          uplink_id: uplink.uplink_id,
          project_id: uplink.project_id,
          tts_device_id: uplink.tts_device_id,
          raw_payload: uplink.raw_payload,
          status: uplink.status,
          created_at: uplink.created_at,
          updated_at: uplink.updated_at,
        })),
        page: projectUplinks.page,
        size: projectUplinks.size,
        count: projectUplinks.count,
        pages: projectUplinks.pages
      },
      message: "Successfully retrieved uplinks for the project.",
    });

  })

  uplinkController.get("/project/:projectId", zValidator("query", UPLINK_QUERY_SCHEMA), async (ctx) => {

    const projectId = Number(ctx.req.param("projectId"))
    const query = ctx.req.valid("query")

    const projectUplinks = await uplinkService.getProjectUplinks(
      projectId,
      {
        created_at_start: query.created_at_start ? new Date(query.created_at_start) : undefined,
        created_at_end: query.created_at_end ? new Date(query.created_at_end) : undefined,
        updated_at_start: query.updated_at_start ? new Date(query.updated_at_start) : undefined,
        updated_at_end: query.updated_at_end ? new Date(query.updated_at_end) : undefined,
        tts_device_id: query.tts_device_id ? query.tts_device_id : undefined,
        sort_order: query.sort_order ?? 'desc',
        processed: query.processed ?? false,
        unprocessed: query.unprocessed ?? false,
        failed: query.failed ?? false,
      },
    )

    return ctx.json<ProjectUplinksContract>({
      success: true,
      message: "Successfully retrieved uplinks for this project.",
      data: projectUplinks.map((uplink) => ({
        uplink_id: uplink.uplink_id,
        project_id: uplink.project_id,
        tts_device_id: uplink.tts_device_id,
        raw_payload: uplink.raw_payload,
        status: uplink.status,
        created_at: uplink.created_at,
        updated_at: uplink.updated_at,
      }))
    })

  })

  uplinkController.get("/project/:projectId/file", zValidator("query", UPLINK_QUERY_SCHEMA), async (ctx) => {

    const projectId = Number(ctx.req.param("projectId"))
    const query = ctx.req.valid("query")

    const uplinkBytes = await uplinkService.createUplinkFile(
      projectId,
      {
        created_at_start: query.created_at_start ? new Date(query.created_at_start) : undefined,
        created_at_end: query.created_at_end ? new Date(query.created_at_end) : undefined,
        updated_at_start: query.updated_at_start ? new Date(query.updated_at_start) : undefined,
        updated_at_end: query.updated_at_end ? new Date(query.updated_at_end) : undefined,
        tts_device_id: query.tts_device_id ? query.tts_device_id : undefined,
        sort_order: query.sort_order ?? 'desc',
        processed: query.processed ?? false,
        unprocessed: query.unprocessed ?? false,
        failed: query.failed ?? false,
      },
    )

    const bytesArray = new Uint8Array(uplinkBytes)

    ctx.header("Content-Type", "text/csv; charset=utf-8");
    ctx.header("Content-Disposition", `attachment; filename="uplinks.csv"`);

    return ctx.body(bytesArray);

  })

  return uplinkController;
}
