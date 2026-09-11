import db from "./connectors/kysely.js";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import SessionService from "./services/session.service.js";
import useSessionController from "./controllers/session.controller.js";
import { PasswordStrategy } from "@road-citizen-inspector/password-strategy";
import { SHA256PasswordStrategy } from "@road-citizen-inspector/password-strategy/256";
import {
  ProjectModel,
  ProvisioningModel,
  SessionModel,
  WebhookKeyModel,
} from "@road-citizen-inspector/models";
import ProjectService from "./services/project.service.js";
import useProjectController from "./controllers/project.controller.js";
import WebhookKeyService from "./services/webhook_key.service.js";
import useWebhookKeyController from "./controllers/webhook_key.controller.js";
import ProvisioningService from "./services/provisioning.service.js";
import useProvisioningController from "./controllers/provisioning.controller.js";
import { sessionExpiryClient } from "./connectors/session_expiry_client.js";
import {cors} from "hono/cors"

const app = new Hono();
const sha256: PasswordStrategy = new SHA256PasswordStrategy();

const sessionModel = new SessionModel(db);
const sessionService = new SessionService(sessionModel, sha256, sessionExpiryClient);
const sessionController = useSessionController(sessionService);
app.route("/session", sessionController);

const projectModel = new ProjectModel(db);
const projectService = new ProjectService(projectModel, sessionService);
const projectController = useProjectController(projectService);
app.route("/project", projectController);

const webhookKeyModel = new WebhookKeyModel(db);
const webhookKeyService = new WebhookKeyService(
  webhookKeyModel,
  sessionService,
);
const webhookKeyController = useWebhookKeyController(webhookKeyService);
app.route("/webhook_key", webhookKeyController);

const provisioningModel = new ProvisioningModel(
  db,
  sessionModel,
  projectModel,
  webhookKeyModel,
);
const provisioningService = new ProvisioningService(
  provisioningModel,
  sessionService,
  sha256,
  sessionExpiryClient
);
const provisioningController = useProvisioningController(provisioningService);
app.route("/provisioning", provisioningController);

serve({
  fetch: app.fetch,
  port: 4001,
});

console.log("Starting Session API Microservice");
