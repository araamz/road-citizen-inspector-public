import { SessionEnv } from "@hono/session"
import { Hono } from "hono"
import { SessionEntryData } from "../../services/authorization.service.js"
import { UserSessionRequired } from "../../middleware/user_session_required.js"
import { serverMap } from "@road-citizen-inspector/server-map/map"
import { proxy } from "hono/proxy"

export default function useStatusProxy() {
    const statusProxy = new Hono<SessionEnv<SessionEntryData>>()
    statusProxy.use(UserSessionRequired)

    statusProxy.get("/paginated", async (ctx) => {

        const sessionEntry = await ctx.var.session.get()

        const query = ctx.req.query()

        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/status/project/${sessionEntry!.project_id}/paginated?${new URLSearchParams(query).toString()}`
        )

    })

    statusProxy.get("/device/:deviceId/latest", async (ctx) => {

        const deviceId = Number(ctx.req.param("deviceId"))

        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/status/device/${deviceId}/latest`
        )

    })

    statusProxy.get("/project", async (ctx) => {

        const sessionEntry = await ctx.var.session.get()
        const query = ctx.req.query()

        console.log("status.proxy.ts", "/project", new URLSearchParams(query).toString())

        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/status/project/${sessionEntry!.project_id}?${new URLSearchParams(query).toString()}`
        )

    })

    statusProxy.get("/project/file", async (ctx) => {

        const sessionEntry = await ctx.var.session.get()
        const query = ctx.req.query()

        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/status/project/${sessionEntry!.project_id}/file?${new URLSearchParams(query).toString()}`
        )

    })

    return statusProxy;
}