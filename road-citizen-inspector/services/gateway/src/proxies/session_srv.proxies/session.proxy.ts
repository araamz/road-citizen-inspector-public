import { Hono } from "hono";
import { proxy } from "hono/proxy";
import {
  AuthorizationService,
  SessionEntryData,
} from "../../services/authorization.service.js";
import { PrivilegedUserSessionRequired } from "../../middleware/privileged_user_session_required.js";
import { SessionEnv } from "@hono/session";
import { serverMap } from "@road-citizen-inspector/server-map/map";
import { UserSessionRequired } from "../../middleware/user_session_required.js";

export function useSessionProxy() {
  const sessionProxy = new Hono<SessionEnv<SessionEntryData>>();

  sessionProxy.post("/", async (ctx) => {
    return proxy(`${serverMap.services.RCI_SESSION_API}/provisioning/session`, {
      ...ctx.req,
    });
  });

  sessionProxy.get("/:sessionId", async (ctx) => {
    const sessionId = ctx.req.param("sessionId");
    return proxy(`${serverMap.services.RCI_SESSION_API}/session/${sessionId}`, {
      ...ctx.req,
    });
  });

  sessionProxy.get("/", UserSessionRequired, async (ctx) => {
    const sessionEntry = await ctx.var.session.get();
    return proxy(
      `${serverMap.services.RCI_SESSION_API}/session/${
        sessionEntry!.session_id
      }`
    );
  });

  sessionProxy.patch("/", PrivilegedUserSessionRequired, async (ctx) => {
    const processedBody = await ctx.req.json();
    const sessionEntry = await ctx.var.session.get();

    return proxy(
      `${serverMap.services.RCI_SESSION_API}/session/${
        sessionEntry!.session_id
      }`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        body: JSON.stringify(processedBody),
      }
    );
  });

  sessionProxy.patch("/remove", PrivilegedUserSessionRequired, async (ctx) => {
    const sessionEntry = await ctx.var.session.get();

    return proxy(
      `${serverMap.services.RCI_SESSION_API}/session/${
        sessionEntry!.session_id
      }/remove`,
      {
        method: "PATCH",
      }
    );
  });

  sessionProxy.patch(
    "/visibility",
    PrivilegedUserSessionRequired,
    async (ctx) => {
      const processedBody = await ctx.req.json();
      const sessionEntry = await ctx.var.session.get();

      return proxy(
        `${serverMap.services.RCI_SESSION_API}/session/${
          sessionEntry!.session_id
        }/visibility`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "PATCH",
          body: JSON.stringify(processedBody),
        }
      );
    }
  );

  sessionProxy.patch(
    "/administrative_password",
    PrivilegedUserSessionRequired,
    async (ctx) => {
      const processedBody = await ctx.req.json();
      const sessionEntry = await ctx.var.session.get();

      return proxy(
        `${serverMap.services.RCI_SESSION_API}/session/${
          sessionEntry!.session_id
        }/administrative_password`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "PATCH",
          body: JSON.stringify(processedBody),
        }
      );
    }
  );

  return sessionProxy;
}
