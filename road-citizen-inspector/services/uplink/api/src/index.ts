import { Hono } from "hono";
import db from "./connectors/kysely.js";
import {
  DeviceModel,
  ReadingModel,
  StatusModel,
  UplinkModel,
} from "@road-citizen-inspector/models/uplink";
import { UplinkService } from "./services/uplink.service.js";
import useUplinkController from "./controllers/uplink.controller.js";
import { serve } from "@hono/node-server";
import { DeviceService } from "./services/device.service.js";
import { uplinkProcessorClient } from "./connectors/uplink_processing_client.js";
import useDeviceController from "./controllers/device.controller.js";
import { ReadingService } from "./services/reading.service.js";
import useReadingController from "./controllers/reading.controller.js";
import { SerializedServiceError, ServiceError } from "./services/service.js";
import { ContractError } from "@road-citizen-inspector/contracts";
import useStatusController from "./controllers/status.controller.js";
import { StatusService } from "./services/status.service.js";
import { VisualizationService } from "./services/visualization.service.js";
import useVisualizationController from "./controllers/visualization.controller.js";

const app = new Hono();

const deviceModel = new DeviceModel(db);
const deviceService = new DeviceService(deviceModel);
const deviceController = useDeviceController(deviceService);
app.route("/device", deviceController);

const uplinkModel = new UplinkModel(db);
const uplinkService = new UplinkService(
  uplinkModel,
  uplinkProcessorClient,
);
const uplinkController = useUplinkController(uplinkService);
app.route("/uplink", uplinkController);

const readingModel = new ReadingModel(db);
const readingService = new ReadingService(
  readingModel,
  uplinkService,
  deviceService,
);
const readingController = useReadingController(readingService);
app.route("/reading", readingController);

const statusModel = new StatusModel(db)
const statusService = new StatusService(statusModel, deviceService, uplinkService);
const statusController = useStatusController(statusService);
app.route("/status", statusController);

const visualizationService = new VisualizationService(readingModel, statusModel, deviceModel);
const visualizationController = useVisualizationController(visualizationService)
app.route("/visualization", visualizationController)

app.onError((error, ctx) => {
  if (error instanceof ServiceError) {
    return ctx.json<ContractError<SerializedServiceError<unknown>>>(
      {
        success: false,
        message: error.message,
        error: error,
      },
      400,
    );
  } else if (error instanceof Error) {
    return ctx.json<ContractError<unknown>>(
      {
        success: false,
        message: error.message || "Unknown error occurred.",
        error: error.cause || null,
      },
      500,
    );
  } else {
    return ctx.json<ContractError<unknown | null>>(
      {
        success: false,
        message: "An unexpected error occurred.",
        error: null,
      },
      500,
    );
  }
});

serve({
  fetch: app.fetch,
  port: 4002,
});

console.log("Starting Uplink API Microservice");
