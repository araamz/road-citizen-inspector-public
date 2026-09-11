import { Hono } from "hono";
import WebhookKeyService from "../services/webhook_key.service.js";
import { WebhookKey } from "@road-citizen-inspector/models";
import { Context } from "hono";
import {
  ContractError,
  LatestWebhookKeyContract,
  SessionWebhookKeysContract,
  WebhookKeyContract,
} from "@road-citizen-inspector/contracts";
import { ServiceError } from "../services/service.js";

export default function webhookKeyController(
  webhookKeyService: WebhookKeyService
) {
  const webhookKeyController = new Hono();

  const maskWebhookKey = (key: string, visible: number = 4, maskChar = "*") => {
    const n = Math.max(0, Math.min(visible, key.length));
    return maskChar.repeat(key.length - n) + key.slice(-n);
  };

  webhookKeyController.post("/:sessionId", async (ctx: Context) => {
    const sessionId = Number(ctx.req.param("sessionId"));
    const createdWebhookKey = await webhookKeyService.createWebhookKey(
      sessionId
    );

    return ctx.json<WebhookKeyContract>({
      success: true,
      message: "Webhook key created successfully.",
      data: {
        session_id: createdWebhookKey.session_id,
        created_at: createdWebhookKey.created_at,
        updated_at: createdWebhookKey.updated_at,
        webhook_key_id: createdWebhookKey.webhook_key_id,
        is_revoked: createdWebhookKey.is_revoked,
        hashed_key_preview: createdWebhookKey.hashed_key,
      },
    });
  });

  webhookKeyController.get("/key", async (ctx: Context) => {
    const webhookKey = ctx.req.header()["webhook_key"];

    const foundWebhookKey = await webhookKeyService.getWebhookkeyByKey(
      webhookKey
    );

    return ctx.json<WebhookKeyContract>({
      success: true,
      message: "Webhook key retrieved successfully.",
      data: {
        session_id: foundWebhookKey.session_id,
        created_at: foundWebhookKey.created_at,
        updated_at: foundWebhookKey.updated_at,
        webhook_key_id: foundWebhookKey.webhook_key_id,
        is_revoked: foundWebhookKey.is_revoked,
        hashed_key_preview: maskWebhookKey(foundWebhookKey.hashed_key),
      },
    });
  });

  webhookKeyController.get("/:webhookKeyId", async (ctx: Context) => {
    const webhookKeyId = Number(ctx.req.param("webhookKeyId"));

    const foundWebhookKey = await webhookKeyService.getWebhookKeyById(
      webhookKeyId
    );

    return ctx.json<WebhookKeyContract>({
      success: true,
      message: "Webhook key retrieved successfully.",
      data: {
        session_id: foundWebhookKey.session_id,
        created_at: foundWebhookKey.created_at,
        updated_at: foundWebhookKey.updated_at,
        webhook_key_id: foundWebhookKey.webhook_key_id,
        is_revoked: foundWebhookKey.is_revoked,
        hashed_key_preview: maskWebhookKey(foundWebhookKey.hashed_key),
      },
    });
  });

  webhookKeyController.get(
    "/session/:sessionId/latest_key",
    async (ctx: Context) => {
      const sessionId = Number(ctx.req.param("sessionId"));

      const latestWebhookKey =
        await webhookKeyService.getLatestActiveWebhookKey(sessionId);

      return ctx.json<LatestWebhookKeyContract>({
        success: true,
        message: "Latest webhook key retrieved successfully.",
        data: {
          session_id: latestWebhookKey.session_id,
          created_at: latestWebhookKey.created_at,
          updated_at: latestWebhookKey.updated_at,
          webhook_key_id: latestWebhookKey.webhook_key_id,
          is_revoked: latestWebhookKey.is_revoked,
          hashed_key: latestWebhookKey.hashed_key,
        },
      });
    }
  );

  webhookKeyController.get("/session/:sessionId", async (ctx: Context) => {
    const sessionId = Number(ctx.req.param("sessionId"));
    let revokedKeysQuery: boolean | null = null;

    const revokedParam = ctx.req.query("revoked");
    if (revokedParam === undefined) {
      // No query param -> don't filter on is_revoked
      revokedKeysQuery = null;
    } else if (revokedParam === "true") {
      revokedKeysQuery = true;
    } else if (revokedParam === "false") {
      revokedKeysQuery = false;
    }
    const sessionWebhookKeys =
      await webhookKeyService.getWebhookKeysBySessionId(sessionId, revokedKeysQuery);

    const maskedWebhookKeys = sessionWebhookKeys.map((key) => ({
      session_id: key.session_id,
      created_at: key.created_at,
      updated_at: key.updated_at,
      webhook_key_id: key.webhook_key_id,
      is_revoked: key.is_revoked,
      hashed_key_preview: maskWebhookKey(key.hashed_key),
    }));

    return ctx.json<SessionWebhookKeysContract>({
      success: true,
      message: "Webhook keys retrieved successfully.",
      data: maskedWebhookKeys,
    });
  });

  webhookKeyController.patch("/:webhookKeyId/revoke", async (ctx: Context) => {
    const webhookKeyId = Number(ctx.req.param("webhookKeyId"));

    const revokedWebhookKey = await webhookKeyService.revokeWebhookKey(
      webhookKeyId
    );

    return ctx.json<WebhookKeyContract>({
      success: true,
      message: "Webhook key revoked successfully.",
      data: {
        session_id: revokedWebhookKey.session_id,
        created_at: revokedWebhookKey.created_at,
        updated_at: revokedWebhookKey.updated_at,
        webhook_key_id: revokedWebhookKey.webhook_key_id,
        is_revoked: revokedWebhookKey.is_revoked,
        hashed_key_preview: maskWebhookKey(revokedWebhookKey.hashed_key),
      },
    });
  });

  webhookKeyController.onError((error, ctx) => {
    if (error instanceof ServiceError) {
      return ctx.json<ContractError>(
        {
          success: false,
          message: error.message,
          error: error.details,
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

  return webhookKeyController;
}
