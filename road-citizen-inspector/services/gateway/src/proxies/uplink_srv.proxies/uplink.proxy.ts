import { Hono } from "hono";
import { UserSessionRequired } from "../../middleware/user_session_required.js";
import { SessionEnv } from "@hono/session";
import { SessionEntryData } from "../../services/authorization.service.js";
import { proxy } from "hono/proxy";
import { serverMap } from "@road-citizen-inspector/server-map/map";

export function useUplinkProxy() {
    const uplinkProxy = new Hono<SessionEnv<SessionEntryData>>;

    uplinkProxy.use(UserSessionRequired)

    uplinkProxy.get("/paginated", async (ctx) => {

        const sessionEntry = await ctx.var.session.get()!;
        const query = ctx.req.query();
        console.log('Uplink Proxy - Paginated Query:', `${serverMap.services.RCI_UPLINK_API}/uplink/project/${sessionEntry!.project_id}/paginated?${new URLSearchParams(query).toString()}`);
        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/uplink/project/${sessionEntry!.project_id}/paginated?${new URLSearchParams(query).toString()}`
        )

    })

    uplinkProxy.get("/project", async (ctx) => {
        const sessionEntry = await ctx.var.session.get();
        const query = ctx.req.query();

        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/uplink/project/${sessionEntry!.project_id}?${new URLSearchParams(query).toString()}`
        )
    })

    uplinkProxy.get("/project/file", async (ctx) => {

        const sessionEntry = await ctx.var.session.get()
        const query = ctx.req.query()

        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/uplink/project/${sessionEntry!.project_id}/file?${new URLSearchParams(query).toString()}`
        )

    })

    return uplinkProxy;
}