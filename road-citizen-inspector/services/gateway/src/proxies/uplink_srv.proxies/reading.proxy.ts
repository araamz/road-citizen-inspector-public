import { SessionEnv } from "@hono/session";
import { Hono } from "hono";
import { SessionEntryData } from "../../services/authorization.service.js";
import { UserSessionRequired } from "../../middleware/user_session_required.js";
import { proxy } from "hono/proxy";
import { serverMap } from "@road-citizen-inspector/server-map/map";

export default function useReadingProxy() {
    const readingProxy = new Hono<SessionEnv<SessionEntryData>>;
    readingProxy.use(UserSessionRequired)

    readingProxy.get("/paginated", async (ctx) => {

        const sessionEntry = await ctx.var.session.get();

        const query = ctx.req.query();

        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/reading/project/${sessionEntry?.project_id}/paginated?${new URLSearchParams(query).toString()}`
        )

    })

    readingProxy.get("/project", async (ctx) => {

        const sessionEntry = await ctx.var.session.get()

        const query = ctx.req.query()

        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/reading/project/${sessionEntry?.project_id}?${new URLSearchParams(query).toString()}`
        )
    })

    readingProxy.get("/project/file", async (ctx) => {

        const sessionEntry = await ctx.var.session.get()
        const query = ctx.req.query()

        return proxy(
            `${serverMap.services.RCI_UPLINK_API}/reading/project/${sessionEntry!.project_id}/file?${new URLSearchParams(query).toString()}`
        )

    })

    return readingProxy;
}