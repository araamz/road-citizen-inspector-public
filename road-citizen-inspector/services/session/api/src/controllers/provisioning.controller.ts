import { Context, Hono } from "hono";
import ProvisioningService from "../services/provisioning.service.js";
import { zValidator } from "@hono/zod-validator";
import {
  NEW_PROJECT_SCHEMA,
  NEW_SESSION_SCHEMA,
} from "@road-citizen-inspector/schemas";
import {
  ContractError,
  SessionClaimContract,
  SessionContract,
  SessionGenerationProvisionContract,
} from "@road-citizen-inspector/contracts";
import { ServiceError } from "../services/service.js";

export default function useProvisioningController(
  provisioningService: ProvisioningService,
) {
  const provisioningController = new Hono();

  provisioningController.post(
    "/session_claim",
    zValidator("json", NEW_PROJECT_SCHEMA),
    async (ctx: Context) => {
      const { session_id, tts_app_id } = await ctx.req.json();

      const { project, session } = await provisioningService.claimSession(
        session_id,
        tts_app_id,
      );

      return ctx.json<SessionClaimContract>({
        success: true,
        message: "Session claimed successfully.",
        data: {
          project: project,
          session: {
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
        },
      });
    },
  );

  provisioningController.post(
    "/session",
    zValidator("json", NEW_SESSION_SCHEMA),
    async (ctx: Context) => {
      const {
        title,
        description,
        password,
        administrative_password,
        visibility,
      } = await ctx.req.json();
      const { session, webhookKey } =
        await provisioningService.generateNewSessionComposite(
          title,
          description,
          password ? password : null,
          visibility,
          administrative_password,
        );

      return ctx.json<SessionGenerationProvisionContract>({
        success: true,
        message: "Generated session successfully.",
        data: {
          session: {
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
          webhookKey: webhookKey,
        },
      });
    },
  );

  provisioningController.onError((error, ctx) => {
    if (error instanceof ServiceError) {
      return ctx.json<ContractError>(
        {
          success: false,
          message: error.message,
          error: error.details,
        },
        500,
      );
    } else if (error instanceof Error) {
      return ctx.json<ContractError<unknown | null>>(
        {
          success: false,
          message: error.message || "Unknown error occurred.",
          error: error.cause || null,
        },
        500,
      );
    } else {
      return ctx.json<ContractError<unknown | null>>(
        {
          success: false,
          message: "An unexpected error occurred.",
          error: null,
        },
        500,
      );
    }
  });

  return provisioningController;
}
