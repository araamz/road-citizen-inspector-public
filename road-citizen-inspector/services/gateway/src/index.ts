import { Hono } from "hono";
import { SessionEnv, useSession, useSessionStorage } from "@hono/session";
import { serve } from "@hono/node-server";
import db from "./connectors/kysely.js";
import { SessionModel } from "@road-citizen-inspector/models";
import {SHA256PasswordStrategy} from "@road-citizen-inspector/password-strategy"
import {
  AuthorizationService,
  SessionEntryData,
} from "./services/authorization.service.js";
import { redisClient } from "./connectors/redis.js";
import { useAuthorizationController } from "./controllers/authorization.controller.js";
import { useSessionProxy } from "./proxies/session_srv.proxies/session.proxy.js";
import { useProjectProxy } from "./proxies/session_srv.proxies/project.proxy.js";
import { useWebhookKeyProxy } from "./proxies/session_srv.proxies/webhook_key.proxy.js";
import { cors } from "hono/cors"
import { useDeviceProxy } from "./proxies/uplink_srv.proxies/device.proxy.js";
import { useUplinkProxy } from "./proxies/uplink_srv.proxies/uplink.proxy.js";
import useReadingProxy from "./proxies/uplink_srv.proxies/reading.proxy.js";
import useStatusProxy from "./proxies/uplink_srv.proxies/status.proxy.js";
import useVisualizationProxy from "./proxies/uplink_srv.proxies/visualization.proxy.js";

const app = new Hono<SessionEnv<SessionEntryData>>();

const sessionModel = new SessionModel(db);
const passwordStrategy = new SHA256PasswordStrategy();
const authorizationService = new AuthorizationService(
  sessionModel,
  redisClient,
  passwordStrategy,
  60 * 60 * 2 + 10 // 2 hours
);

app.use(
  "/*", cors({
    origin: ["http://localhost:3000", "http://rci.azaremehrjardi.dev", "https://rci.azaremehrjardi.dev"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "PATCH", "DELETE"],
    credentials: true
  })
)
app.use(
  useSessionStorage({
    delete(sid: string) {
      authorizationService.revokeSessionEntry(sid);
    },
    get(sid: string) {
      return authorizationService.getSessionEntry(sid);
    },
    set(sid: string, data: SessionEntryData) {
      authorizationService.saveSessionEntry(sid, data);
    },
  }),
  useSession({
    secret: "darius",
    duration: {
      absolute: 60 * 60 * 2, // 2 hours
      inactivity: 60 * 30, // 30 minutes
    }
  }),
);

app.route("/authorization", useAuthorizationController(authorizationService));
app.route("/session", useSessionProxy());
app.route("/project", useProjectProxy());
app.route("/webhook_key", useWebhookKeyProxy())
app.route("/device", useDeviceProxy())
app.route("/uplink", useUplinkProxy())
app.route("/reading", useReadingProxy())
app.route('/status', useStatusProxy())
app.route("/visualization", useVisualizationProxy())

serve({
  fetch: app.fetch,
  port: 4000,
});
