import { SessionEnv } from "@hono/session";
import { Hono } from "hono";
import {
  AuthorizationService,
  SessionEntryData,
} from "../../services/authorization.service.js";
import { proxy } from "hono/proxy";
import { serverMap } from "@road-citizen-inspector/server-map/map";
import { PrivilegedUserSessionRequired } from "../../middleware/privileged_user_session_required.js";

export function useWebhookKeyProxy() {
  const webhookKeyProxy = new Hono<SessionEnv<SessionEntryData>>();
  webhookKeyProxy.use(PrivilegedUserSessionRequired);

  // Create Webhook Key
  webhookKeyProxy.post("/", async (ctx) => {
    const sessionEntry = await ctx.var.session.get();

    return proxy(
      `${serverMap.services.RCI_SESSION_API}/webhook_key/${sessionEntry!.session_id}`,
      {
        method: "POST",
      }
    );
  });

  // Get All Webhook Keys
  webhookKeyProxy.get("/", async (ctx) => {
    console.log("Getting all webhook keys via proxy", ctx.req.queries());
    const sessionEntry = await ctx.var.session.get();
    const searchParams = new URLSearchParams(ctx.req.queries());
    return proxy(
      `${serverMap.services.RCI_SESSION_API}/webhook_key/session/${sessionEntry!.session_id}?${searchParams.toString()}`
    );
  });

  // Get One Webhook Key
  webhookKeyProxy.get("/key/:webhookKeyId", async (ctx) => {
    const webhookKeyId = Number(ctx.req.param("webhookKeyId"));
    return proxy(
      `${serverMap.services.RCI_SESSION_API}/webhook_key/${webhookKeyId}`
    );
  });

  // Get Latest Webhook Key
  webhookKeyProxy.get("/latest", async (ctx) => {
    const sessionEntry = await ctx.var.session.get()
    return proxy(`${serverMap.services.RCI_SESSION_API}/webhook_key/session/${sessionEntry!.session_id}/latest_key`)
  });

  // Revoke One Webhook Key
  webhookKeyProxy.patch("/revoke/:webhookKeyId", async (ctx) => {
    const webhookKeyId = ctx.req.param("webhookKeyId")
    return proxy(`${serverMap.services.RCI_SESSION_API}/webhook_key/${webhookKeyId}/revoke`, {
      method: "PATCH"
    })
  });

  return webhookKeyProxy;
}
