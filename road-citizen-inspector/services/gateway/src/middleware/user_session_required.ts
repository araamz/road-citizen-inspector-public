import { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { SessionEntryData } from "../services/authorization.service.js";
import { ContractError } from "@road-citizen-inspector/contracts";

const UserSessionRequired = createMiddleware(async (ctx: Context, next) => {
  const sessionEntry: SessionEntryData = await ctx.var.session.get();

  if (!sessionEntry) {
    return ctx.json<ContractError>(
      {
        success: false,
        message: "Session is not found. An active session must be established.",
        error: null,
      },
      401,
    );
  }

  return next();
});

export { UserSessionRequired };
