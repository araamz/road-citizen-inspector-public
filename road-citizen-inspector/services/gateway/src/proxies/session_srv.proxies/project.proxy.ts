import { Context, Hono } from "hono";
import {
  AuthorizationService,
  SessionEntryData,
} from "../../services/authorization.service.js";
import { SessionEnv } from "@hono/session";
import { proxy } from "hono/proxy";
import { serverMap } from "@road-citizen-inspector/server-map/map";
import { UserSessionRequired } from "../../middleware/user_session_required.js";

export function useProjectProxy() {
  const projectProxy = new Hono<SessionEnv<SessionEntryData>>();

  projectProxy.get("/", UserSessionRequired, async (ctx) => {
    const sessionEntry = await ctx.var.session.get();
    return proxy(
      `${serverMap.services.RCI_SESSION_API}/project/session/${
        sessionEntry!.session_id
      }`
    );
  });

  return projectProxy;
}
