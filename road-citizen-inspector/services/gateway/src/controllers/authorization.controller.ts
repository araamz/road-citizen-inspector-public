import { Context, Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  ADMINISTRATIVE_AUTHORIZATION_SCHEMA,
  PRIVATE_AUTHORIZATION_SCHEMA,
  PUBLIC_AUTHORIZATION_SCHEMA,
} from "@road-citizen-inspector/schemas";
import {
  AuthorizationService,
  SessionEntryData,
} from "../services/authorization.service.js";
import {
  AuthorizationContract,
  Contract,
  ContractError,
} from "@road-citizen-inspector/contracts";
import { SerializedServiceError, ServiceError } from "../services/service.js";
import { SessionEnv } from "@hono/session";
import { UserSessionRequired } from "../middleware/user_session_required.js";

export function useAuthorizationController(
  authorizationService: AuthorizationService
) {
  const authorizationController = new Hono<SessionEnv<SessionEntryData>>();

  authorizationController.get("/", UserSessionRequired, async (ctx) => {
    const sessionEntry = await ctx.var.session.get();

    const session = await authorizationService
      .getSession(sessionEntry!.session_id)
      .catch((error) => {
        throw error;
      });

    return ctx.json<AuthorizationContract>({
      success: true,
      message: "Successfully retrived session.",
      data: {
        role: sessionEntry!.role,
        session: {
          session_id: session.session_id,
          title: session.title,
          description: session.description,
          status: session.status,
          project_id: session.project_id,
          tts_app_id: session.tts_app_id,
          visibility: session.visibility,
          created_at: session.created_at,
          updated_at: session.updated_at,
          active_at: session.active_at,
        },
      },
    });
  });

  authorizationController.post(
    "/administrative",
    zValidator("json", ADMINISTRATIVE_AUTHORIZATION_SCHEMA),
    async (ctx) => {
      const { cred_administrative_password, cred_session_id } =
        await ctx.req.json();

      const session = await authorizationService
        .verifyAdministrativeSession(
          Number(cred_session_id),
          cred_administrative_password
        )
        .then(async (session) => {
          await ctx.var.session.update({
            session_id: session.session_id,
            project_id: session.project_id ? session.project_id : null,
            role: "administrator",
          });

          return session;
        })
        .catch((error) => {
          throw error;
        });

      return ctx.json<AuthorizationContract>({
        success: true,
        message: "Successfully granted authorization.",
        data: {
          session: {
            session_id: session.session_id,
            title: session.title,
            description: session.description,
            status: session.status,
            project_id: session.project_id,
            tts_app_id: session.tts_app_id,
            visibility: session.visibility,
            created_at: session.created_at,
            updated_at: session.updated_at,
            active_at: session.active_at,
          },
          role: "administrator",
        },
      });
    }
  );

  authorizationController.post(
    "/private",
    zValidator("json", PRIVATE_AUTHORIZATION_SCHEMA),
    async (ctx: Context) => {
      const { cred_session_id, cred_password } = await ctx.req.json();

      const session = await authorizationService
        .verifyPrivateSession(Number(cred_session_id), cred_password)
        .then(async (session) => {
          await ctx.var.session.update({
            session_id: session.session_id,
            project_id: session.project_id ? session.project_id : null,
            role: "viewer",
          });
          return session;
        })
        .catch((error) => {
          throw error;
        });

      return ctx.json<AuthorizationContract>({
        success: true,
        message: "Successfully granted authorization.",
        data: {
          session: {
            session_id: session.session_id,
            title: session.title,
            description: session.description,
            status: session.status,
            project_id: session.project_id,
            tts_app_id: session.tts_app_id,
            visibility: session.visibility,
            created_at: session.created_at,
            updated_at: session.updated_at,
            active_at: session.active_at,
          },
          role: "viewer",
        },
      });
    }
  );

  authorizationController.post(
    "/public",
    zValidator("json", PUBLIC_AUTHORIZATION_SCHEMA),
    async (ctx: Context) => {
      const { cred_session_id } = await ctx.req.json();
      const session = await authorizationService
        .verifyPublicSession(Number(cred_session_id))
        .then(async (session) => {
          await ctx.var.session.update({
            session_id: session.session_id,
            project_id: session.project_id ? session.project_id : null,
            role: "viewer",
          });
          return session;
        })
        .catch((error) => {
          throw error;
        });

      return ctx.json<AuthorizationContract>({
        success: true,
        message: "Successfully granted authorization.",
        data: {
          session: {
            session_id: session.session_id,
            title: session.title,
            description: session.description,
            status: session.status,
            project_id: session.project_id,
            tts_app_id: session.tts_app_id,
            visibility: session.visibility,
            created_at: session.created_at,
            updated_at: session.updated_at,
            active_at: session.active_at,
          },
          role: "viewer",
        },
      });
    }
  );

  authorizationController.delete("/", async (ctx) => {
    const sessionEntry = await ctx.var.session.get();

    if (!sessionEntry)
      return ctx.json<Contract>({
        success: true,
        message: "Successfully left session.",
        data: null,
      });

    await ctx.var.session.delete();

    return ctx.json<
      Contract<{
        session_id: number;
      }>
    >({
      success: true,
      message: "Successfully left session.",
      data: {
        session_id: sessionEntry.session_id,
      },
    });
  });

  authorizationController.onError((error, ctx) => {
    if (error instanceof ServiceError) {
      if (error.name === "session_administrative_credential_error") {
        return ctx.json<ContractError<SerializedServiceError<null>>>(
          {
            success: false,
            message: error.message,
            error: error,
          },
          401
        );
      } else if (error.name === "session_credential_error") {
        return ctx.json<ContractError<SerializedServiceError<null>>>(
          {
            success: false,
            message: error.message,
            error: error,
          },
          401
        );
      } else if (error.name === "session_generation_error") {
        return ctx.json<ContractError<SerializedServiceError<null>>>(
          {
            success: false,
            message: error.message,
            error: error,
          },
          500
        );
      } else if (error.name === "session_revoke_error") {
        return ctx.json<ContractError<SerializedServiceError<null>>>(
          {
            success: false,
            message: error.message,
            error: error,
          },
          500
        );
      } else if (error.name === "session_verification_error") {
        return ctx.json<ContractError<SerializedServiceError<null>>>(
          {
            success: false,
            message: error.message,
            error: error,
          },
          500
        );
      } else {
        return ctx.json<ContractError<SerializedServiceError<null>>>(
          {
            success: false,
            message: error.message,
            error: error,
          },
          500
        );
      }
    } else if (error instanceof Error) {
      return ctx.json<ContractError<unknown>>(
        {
          success: false,
          message: error.message || "Unknown error occurred.",
          error: error.cause || null,
        },
        500
      );
    } else {
      return ctx.json<ContractError<unknown | null>>(
        {
          success: false,
          message: "An unexpected error occurred.",
          error: null,
        },
        500
      );
    }
  });

  return authorizationController;
}
