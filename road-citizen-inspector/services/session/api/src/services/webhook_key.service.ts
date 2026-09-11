import { WebhookKey, WebhookKeyModel } from "@road-citizen-inspector/models";
import Service, { ServiceError } from "./service.js";
import { randomUUID } from "node:crypto";
import SessionService from "./session.service.js";

export default class WebhookKeyService extends Service {
  private webhookKeyModel: WebhookKeyModel;
  private sessionService: SessionService;

  constructor(
    webhookKeyModel: WebhookKeyModel,
    sessionService: SessionService,
  ) {
    super();
    this.webhookKeyModel = webhookKeyModel;
    this.sessionService = sessionService;
  }

  private WebhookKeyCreationError(
    message: string,
    details: Pick<WebhookKey, "session_id" | "hashed_key" | "is_revoked">,
  ) {
    return new ServiceError(message, "webhook_key_creation_failure", details);
  }

  private WebhookKeyNotFoundError(
    message: string,
    details: Partial<
      Pick<WebhookKey, "webhook_key_id" | "hashed_key" | "session_id">
    >,
  ) {
    return new ServiceError(message, "webhook_key_not_found", details);
  }

  private WebhookKeyUpdateError(
    message: string,
    details: Pick<WebhookKey, "webhook_key_id" | "hashed_key" | "is_revoked">,
  ) {
    return new ServiceError(message, "webhook_key_update_failure", details);
  }

  async createWebhookKey(sessionId: number) {
    const key = randomUUID();
    return this.sessionService.getSession(sessionId).then((session) =>
      this.webhookKeyModel
        .createWebhookKey({
          session_id: session.session_id,
          hashed_key: key,
          is_revoked: false,
        })
        .then((webhookKey) => {
          if (!webhookKey)
            throw this.WebhookKeyCreationError(
              "An error occured while creating the webhook key. Creating a webhook key failed.",
              {
                session_id: sessionId,
                hashed_key: key,
                is_revoked: false,
              },
            );
          return webhookKey;
        }),
    );
  }

  async getWebhookKeyById(webhookKeyId: number) {
    return this.webhookKeyModel
      .getWebhookKeyByWebhookId(webhookKeyId)
      .then((webhookKey) => {
        if (!webhookKey)
          throw this.WebhookKeyNotFoundError(
            "Webhook Key was not found. Failed to retrieve the webhook key.",
            { webhook_key_id: webhookKeyId },
          );
        return webhookKey;
      });
  }

  async getWebhookkeyByKey(key: string) {
    return this.webhookKeyModel
      .getWebhookKeyByWebhookKey(key)
      .then((webhookKey) => {
        if (!webhookKey)
          throw this.WebhookKeyNotFoundError(
            "Webhook Key was not found. Failed to retrieve the webhook key.",
            { hashed_key: key },
          );
        return webhookKey;
      });
  }

  async getWebhookKeysBySessionId(
    sessionId: number,
    showRevokedKeys: boolean | null = null,
  ) {
    return this.sessionService
      .getSession(sessionId)
      .then((session) =>
        this.webhookKeyModel.getWebhookKeysBySessionId(
          sessionId,
          showRevokedKeys === null ? undefined : showRevokedKeys,
        ),
      )
      .then((webhookKeys) => {
        return webhookKeys;
      });
  }

  async getLatestActiveWebhookKey(sessionId: number) {
    return this.sessionService
      .getSession(sessionId)
      .then((session) =>
        this.webhookKeyModel.getLatestActiveWebhookKeyBySessionId(sessionId),
      )
      .then((webhookKey) => {
        if (!webhookKey)
          throw this.WebhookKeyNotFoundError(
            "Webhook Key was not found. Failed to get the latest active webhook key.",
            { session_id: sessionId },
          );
        return webhookKey;
      });
  }

  async revokeWebhookKey(webhookKeyId: number) {
    return this.webhookKeyModel
      .getWebhookKeyByWebhookId(webhookKeyId)
      .then(async (webhookKey) => {
        if (!webhookKey)
          throw this.WebhookKeyNotFoundError(
            "Webhook Key was not found. Failed to revoke the webhook key.",
            { webhook_key_id: webhookKeyId },
          );

        if (webhookKey.is_revoked) return webhookKey;
        const updatedWebhookKey =
          await this.webhookKeyModel.updateWebhookByWebhookKeyId(webhookKeyId, {
            is_revoked: true,
          });

        if (!updatedWebhookKey)
          throw this.WebhookKeyUpdateError(
            "An error occured while updating the webhook key. Failed to revoke the webhook key.",
            {
              webhook_key_id: webhookKeyId,
              hashed_key: webhookKey.hashed_key,
              is_revoked: webhookKey.is_revoked,
            },
          );
        return updatedWebhookKey;
      });
  }
}
