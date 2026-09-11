import { createMiddleware } from "hono/factory";
import { SessionEntryData } from "../services/authorization.service.js";
import { ContractError } from "@road-citizen-inspector/contracts";
import { Context } from "hono";
import { SessionEnv } from "@hono/session";
import { every } from "hono/combine";
import { UserSessionRequired } from "./user_session_required.js";

const PrivilegedUserSessionRequired = every(
  UserSessionRequired,
  createMiddleware(async (ctx: Context<SessionEnv<SessionEntryData>>, next) => {
    const sessionEntry = await ctx.var.session.get();

    if (sessionEntry!.role !== "administrator") {
      return ctx.json<ContractError>(
        {
          success: false,
          message:
            "The current active session does not meet the required permissions.",
          error: null,
        },
        403
      );
    } else {
      await next();
    }
  })
);

export { PrivilegedUserSessionRequired };
