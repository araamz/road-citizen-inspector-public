import { SessionData, SessionEnv } from "@hono/session";
import { Hono } from "hono";
import { SessionEntryData } from "../../services/authorization.service.js";
import { proxy } from "hono/proxy";
import { serverMap } from "@road-citizen-inspector/server-map/map";
import { UserSessionRequired } from "../../middleware/user_session_required.js";

export default function useVisualizationProxy() {
    const visualizationProxy = new Hono<SessionEnv<SessionEntryData>>()

    visualizationProxy.get("/project/composite", UserSessionRequired, async (ctx) => {
        const sessionEntry = await ctx.var.session.get();

        const query = ctx.req.url.split('?')[1]

        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/visualization/project/${sessionEntry!.project_id}/composite?${query}`
        )
    })

    visualizationProxy.get("/session/:sessionId/preview", async (ctx) => {
        const sessionId = ctx.req.param('sessionId')
        const query = ctx.req.url.split("?")[1]

        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/visualization/session/${sessionId}/preview?${query}`
        )
    })

    visualizationProxy.get("/device/:deviceId/summary", async (ctx) => {
        const deviceId = ctx.req.param("deviceId")
        const query = ctx.req.url.split("?")[1]
        console.log(query)
        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/visualization/device/${deviceId}/summary?${query}`
        )
    })

    visualizationProxy.get("/device/:deviceId/preview", async (ctx) => {
        const deviceId = ctx.req.param("deviceId")
        const query = ctx.req.url.split("?")[1]

        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/visualization/device/${deviceId}/preview?${query}`
        )
    })

    return visualizationProxy;
}