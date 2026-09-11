import { SessionEnv } from "@hono/session";
import { Hono } from "hono";
import { SessionEntryData } from "../../services/authorization.service.js";
import { UserSessionRequired } from "../../middleware/user_session_required.js";
import { proxy } from "hono/proxy";
import { serverMap } from "@road-citizen-inspector/server-map/map";

export function useDeviceProxy() {
  const deviceProxy = new Hono<SessionEnv<SessionEntryData>>();

  deviceProxy.get("/", UserSessionRequired, async (ctx) => {
    const sessionEntry = await ctx.var.session.get();

    return proxy(
      `${serverMap.services.RCI_UPLINK_API}/device/project/${
        sessionEntry!.project_id
      }`
    );
  });

  deviceProxy.get("/:deviceId", UserSessionRequired, async (ctx) => {
    const deviceId = Number(ctx.req.param("deviceId"));
    return proxy(`${serverMap.services.RCI_UPLINK_API}/device/${deviceId}`);
  });

  deviceProxy.patch("/:deviceId", UserSessionRequired, async (ctx) => {
    const deviceId = Number(ctx.req.param("deviceId"));
    const processedBody = await ctx.req.json();
    return proxy(`${serverMap.services.RCI_UPLINK_API}/device/${deviceId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(processedBody),
    });
  });

  deviceProxy.get("/:deviceId/config", UserSessionRequired, async (ctx) => {
    const deviceId = Number(ctx.req.param('deviceId'))

    return proxy(`${serverMap.services.RCI_UPLINK_API}/device/${deviceId}/config`)
  })

  return deviceProxy;
}
