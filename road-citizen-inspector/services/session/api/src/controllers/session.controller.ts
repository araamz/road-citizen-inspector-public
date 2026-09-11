import { Hono, type Context } from "hono";
import type SessionService from "../services/session.service.ts";
import { zValidator } from "@hono/zod-validator";
import {
  NEW_SESSION_SCHEMA,
  UPDATED_SESSION_SCHEMA,
  UPDATED_SESSION_VISIBILITY_SCHEMA,
  UPDATED_SESSION_ADMINISTRATIVE_PASSWORD_SCHEMA,
} from "@road-citizen-inspector/schemas/session";
import { logger } from "hono/logger";
import { ServiceError } from "../services/service.js";
import {
  Contract,
  ContractError,
  DeletedSessionContract,
  SessionContract,
} from "@road-citizen-inspector/contracts";
import { Session } from "@road-citizen-inspector/models";

export default function useSessionController(sessionService: SessionService) {
  const sessionController = new Hono();

  sessionController.use(logger());

  sessionController.post(
    "/",
    zValidator("json", NEW_SESSION_SCHEMA),
    async (ctx: Context) => {
      const {
        title,
        description,
        password,
        administrative_password,
        visibility,
      } = await ctx.req.json();
      try {
        const generatedSession = await sessionService.generateNewSession(
          title,
          description,
          password ? password : null,
          visibility,
          administrative_password
        );

        return ctx.json<SessionContract>({
          success: true,
          message: "Session created successfully.",
          data: {
            session_id: generatedSession.session_id,
            title: generatedSession.title,
            description: generatedSession.description,
            status: generatedSession.status,
            project_id: generatedSession.project_id,
            visibility: generatedSession.visibility,
            tts_app_id: generatedSession.tts_app_id,
            created_at: generatedSession.created_at,
            updated_at: generatedSession.updated_at,
            active_at: generatedSession.active_at,
          },
        });
      } catch (error) {
        throw error;
      }
    }
  );

  sessionController.get("/:sessionId", async (ctx: Context) => {
    const sessionId = Number(ctx.req.param("sessionId"));

    const session = await sessionService.getSession(sessionId);

    return ctx.json<SessionContract>({
      success: true,
      message: "Session retrieved successfully.",
      data: {
        session_id: session.session_id,
        title: session.title,
        description: session.description,
        status: session.status,
        project_id: session.project_id,
        visibility: session.visibility,
        tts_app_id: session.tts_app_id,
        created_at: session.created_at,
        updated_at: session.updated_at,
        active_at: session.active_at,
      },
    });
  });

  sessionController.patch(
    "/:sessionId",
    zValidator("json", UPDATED_SESSION_SCHEMA),
    async (ctx: Context) => {
      const { title, description } = await ctx.req.json();
      const sessionId = Number(ctx.req.param("sessionId"));
      try {
        const updatedSession = await sessionService.updateSession(sessionId, {
          title,
          description,
        });

        return ctx.json<SessionContract>({
          success: true,
          message: "Session updated successfully.",
          data: {
            session_id: updatedSession.session_id,
            title: updatedSession.title,
            description: updatedSession.description,
            status: updatedSession.status,
            project_id: updatedSession.project_id,
            visibility: updatedSession.visibility,
            tts_app_id: updatedSession.tts_app_id,
            created_at: updatedSession.created_at,
            updated_at: updatedSession.updated_at,
            active_at: updatedSession.active_at,
          },
        });
      } catch (error) {
        console.log("Error", error)
        throw error;
      }
    }
  );

  sessionController.patch("/:sessionId/remove", async (ctx: Context) => {
    const sessionId = Number(ctx.req.param("sessionId"));

    try {
      const session = await sessionService.removeSession(sessionId);

      return ctx.json<DeletedSessionContract>({
        success: true,
        message: "Session removed successfully.",
        data: {
          session_id: session.session_id,
          tts_app_id: session.tts_app_id,
          is_deleted: session.is_deleted,
        },
      });
    } catch (error) {
      throw error;
    }
  });

  sessionController.patch(
    "/:sessionId/visibility",
    zValidator("json", UPDATED_SESSION_VISIBILITY_SCHEMA),
    async (ctx: Context) => {
      const sessionId = Number(ctx.req.param("sessionId"));
      const { visibility, password } = await ctx.req.json();

      try {
        if (visibility === "public") {
          const updatedSession = await sessionService.makeSessionPublic(
            sessionId
          );

          return ctx.json<SessionContract>({
            success: true,
            message: "Session visibility updated successfully.",
            data: {
              session_id: updatedSession.session_id,
              title: updatedSession.title,
              description: updatedSession.description,
              status: updatedSession.status,
              project_id: updatedSession.project_id,
              visibility: updatedSession.visibility,
              tts_app_id: updatedSession.tts_app_id,
              created_at: updatedSession.created_at,
              updated_at: updatedSession.updated_at,
              active_at: updatedSession.active_at,
            },
          });
        } else {
          const updatedSession = await sessionService.makeSessionPrivate(
            sessionId,
            password
          );

          return ctx.json<SessionContract>({
            success: true,
            message: "Session visibility updated successfully.",
            data: {
              session_id: updatedSession?.session_id,
              title: updatedSession.title,
              description: updatedSession.description,
              status: updatedSession.status,
              project_id: updatedSession.project_id,
              visibility: updatedSession.visibility,
              tts_app_id: updatedSession.tts_app_id,
              created_at: updatedSession.created_at,
              updated_at: updatedSession.updated_at,
              active_at: updatedSession.active_at,
            },
          });
        }
      } catch (error) {
        throw error;
      }
    }
  );

  sessionController.patch(
    "/:sessionId/administrative_password",
    zValidator("json", UPDATED_SESSION_ADMINISTRATIVE_PASSWORD_SCHEMA),
    async (ctx: Context) => {
      const sessionId = Number(ctx.req.param("sessionId"));
      const { administrative_password } = await ctx.req.json();

      try {
        const updatedSession =
          await sessionService.updateAdministrativePassword(
            sessionId,
            administrative_password
          );

        return ctx.json<SessionContract>({
          success: true,
          message: "Session administrative password updated successfully.",
          data: {
            session_id: updatedSession.session_id,
            title: updatedSession.title,
            description: updatedSession.description,
            status: updatedSession.status,
            project_id: updatedSession.project_id,
            visibility: updatedSession.visibility,
            tts_app_id: updatedSession.tts_app_id,
            created_at: updatedSession.created_at,
            updated_at: updatedSession.updated_at,
            active_at: updatedSession.active_at,
          },
        });
      } catch (error) {
        throw error;
      }
    }
  );

  sessionController.onError((error, ctx) => {
    if (error instanceof ServiceError) {
      return ctx.json<
        ContractError<
          Omit<
            Session,
            | "password"
            | "salt"
            | "administrative_password"
            | "administrative_salt"
          >
        >
      >(
        {
          success: false,
          message: error.message,
          error: {
            session_id: error.details.session_id,
            title: error.details.title,
            description: error.details.description,
            status: error.details.status,
            project_id: error.details.project_id,
            visibility: error.details.visibility,
            tts_app_id: error.details.tts_app_id,
            created_at: error.details.created_at,
            updated_at: error.details.updated_at,
            active_at: error.details.active_at,
            is_deleted: error.details.is_deleted,
          },
        },
        500
      );
    } else if (error instanceof Error) {
      return ctx.json<ContractError<unknown | null>>(
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

  return sessionController;
}
