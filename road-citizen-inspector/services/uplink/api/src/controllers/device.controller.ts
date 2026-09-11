import { Hono } from "hono";
import { DeviceService } from "../services/device.service.js";
import { zValidator } from "@hono/zod-validator";
import {
  DEVICE_COMPOSITE_SCHEMA,
  DEVICE_CONFIG_LINK_SCHEMA,
  UPDATED_DEVICE_SCHEMA,
} from "@road-citizen-inspector/schemas";
import { Context } from "hono";
import {
  DeviceConfigurationContract,
  DeviceContract,
  DevicesContract,
} from "@road-citizen-inspector/contracts";
import { success } from "zod/v4";

export default function useDeviceController(deviceService: DeviceService) {
  const deviceController = new Hono();

  deviceController.post(
    "/",
    zValidator("json", DEVICE_COMPOSITE_SCHEMA),
    async (ctx: Context) => {
      const { project_id, tts_device_id, uplink_id } = await ctx.req.json();
      const createdDevice = await deviceService.createDevice(
        project_id,
        tts_device_id,
        uplink_id
      );

      return ctx.json<DeviceContract>({
        success: true,
        message: "Successfully created device.",
        data: {
          device_id: createdDevice.device_id,
          tts_device_id: createdDevice.tts_device_id,
          is_hidden: createdDevice.is_hidden,
          is_pinned: createdDevice.is_pinned,
          label: createdDevice.label,
          description: createdDevice.description,
          project_id: createdDevice.project_id,
          origin_uplink_id: createdDevice.origin_uplink_id,
          config_reading_id: createdDevice.config_reading_id,
          updated_at: createdDevice.updated_at,
          created_at: createdDevice.created_at,
        },
      });
    }
  );

  deviceController.get("/:deviceId", async (ctx: Context) => {
    const deviceId = Number(ctx.req.param("deviceId"));

    const device = await deviceService.getDevice(deviceId);

    return ctx.json<DeviceContract>({
      success: true,
      message: "Successfully retrieved device.",
      data: {
        device_id: device.device_id,
        tts_device_id: device.tts_device_id,
        is_hidden: device.is_hidden,
        is_pinned: device.is_pinned,
        label: device.label,
        description: device.description,
        project_id: device.project_id,
        origin_uplink_id: device.origin_uplink_id,
        config_reading_id: device.config_reading_id,
        updated_at: device.updated_at,
        created_at: device.created_at,
      },
    });
  });

  deviceController.get(
    "/composite/query",
    zValidator("query", DEVICE_COMPOSITE_SCHEMA),
    async (ctx: Context) => {
      const { project_id, tts_device_id } = await ctx.req.query();
      const device = await deviceService.getDeviceByComposite(
        Number(project_id),
        tts_device_id
      );

      return ctx.json<DeviceContract>({
        success: true,
        message: "Successfully retrieved device.",
        data: {
          device_id: device.device_id,
          tts_device_id: device.tts_device_id,
          is_hidden: device.is_hidden,
          is_pinned: device.is_pinned,
          label: device.label,
          description: device.description,
          project_id: device.project_id,
          origin_uplink_id: device.origin_uplink_id,
          config_reading_id: device.config_reading_id,
          updated_at: device.updated_at,
          created_at: device.created_at,
        },
      });
    }
  );

  deviceController.get("/project/:projectId", async (ctx: Context) => {
    const projectId = Number(ctx.req.param("projectId"));

    const devices = await deviceService.getProjectDevices(projectId);

    return ctx.json<DevicesContract>({
      success: true,
      message: "Devices for project retrieved successfully.",
      data: devices,
    });
  });

  deviceController.patch(
    "/:deviceId",
    zValidator("json", UPDATED_DEVICE_SCHEMA),
    async (ctx) => {
      const { is_pinned, is_hidden, label, description } = await ctx.req.json();
      const deviceId = Number(ctx.req.param("deviceId"));

      const updatedDevice = await deviceService.updateDevice(deviceId, {
        is_pinned,
        is_hidden,
        label,
        description,
      });

      return ctx.json<DeviceContract>({
        success: true,
        message: "Successfully updated device.",
        data: {
          device_id: updatedDevice.device_id,
          tts_device_id: updatedDevice.tts_device_id,
          is_hidden: updatedDevice.is_hidden,
          is_pinned: updatedDevice.is_pinned,
          label: updatedDevice.label,
          description: updatedDevice.description,
          project_id: updatedDevice.project_id,
          origin_uplink_id: updatedDevice.origin_uplink_id,
          config_reading_id: updatedDevice.config_reading_id,
          updated_at: updatedDevice.updated_at,
          created_at: updatedDevice.created_at,
        },
      });
    }
  );

  deviceController.get("/:deviceId/config", async (ctx) => {

    const deviceId = Number(ctx.req.param('deviceId'))

    const { device, reading } = await deviceService.getDeviceConfiguration(deviceId)


    return ctx.json<DeviceConfigurationContract>({
      success: true,
      message: "Successfully retrieved device configuration.",
      data: {
        device,
        configuration: reading
      }
    })
  })

  deviceController.patch("/:deviceId/config", zValidator('json', DEVICE_CONFIG_LINK_SCHEMA), async (ctx) => {
    const deviceId = Number(ctx.req.param('deviceId'))

    const { config_reading_id } = ctx.req.valid('json')

    const linkedDevice = await deviceService.linkDeviceConfiguration(
      deviceId,
      config_reading_id
    )

    return ctx.json<DeviceContract>({
      success: true,
      message: "Successfully linked device configuration.",
      data: {
        device_id: linkedDevice.device_id,
        tts_device_id: linkedDevice.tts_device_id,
        is_hidden: linkedDevice.is_hidden,
        is_pinned: linkedDevice.is_pinned,
        label: linkedDevice.label,
        description: linkedDevice.description,
        project_id: linkedDevice.project_id,
        origin_uplink_id: linkedDevice.origin_uplink_id,
        config_reading_id: linkedDevice.config_reading_id,
        updated_at: linkedDevice.updated_at,
        created_at: linkedDevice.created_at,
      }
    })
  })
  return deviceController;
}
