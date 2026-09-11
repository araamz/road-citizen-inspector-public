import type {
  ColumnType,
  Generated,
  Insertable,
  Kysely,
  Selectable,
  Updateable,
} from "kysely";
import type { Transaction } from "kysely";
import type { SessionDatabase } from "./session.database.js";
import { Model } from "../model.js";

export interface WebhookKeyTable {
  webhook_key_id: Generated<number>;
  session_id: number;
  hashed_key: string;
  is_revoked: boolean;
  created_at: ColumnType<string, string, never>;
  updated_at: ColumnType<string | null, never, string>;
}

export type WebhookKey = Selectable<WebhookKeyTable>;
export type NewWebhooKey = Insertable<WebhookKeyTable>;
export type WebhookKeyUpdate = Updateable<WebhookKeyTable>;

export class WebhookKeyModel extends Model<SessionDatabase> {
  constructor(kyselyObject: Kysely<SessionDatabase>) {
    super(kyselyObject);
  }

  async createWebhookKey(
    createParams: Omit<NewWebhooKey, "created_at">,
    trx?: Transaction<SessionDatabase>,
  ) {
    const currentTimestamp = new Date();

    const result = await (trx ? trx : this.db)
      .insertInto("webhook_key")
      .values({
        ...createParams,
        created_at: currentTimestamp.toISOString(),
      })
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async getWebhookKeyByWebhookId(webhookKeyId: number) {
    const result = await this.db
      .selectFrom("webhook_key")
      .selectAll("webhook_key")
      .where("webhook_key_id", "=", webhookKeyId)
      .executeTakeFirst();

    return result;
  }

  async getWebhookKeyByWebhookKey(webhookKey: string) {
    const result = await this.db
      .selectFrom("webhook_key")
      .selectAll("webhook_key")
      .where("hashed_key", "=", webhookKey)
      .executeTakeFirst();

    return result;
  }

  async getWebhookKeysBySessionId(sessionId: number, isRevoked: boolean | null = null) {
    let result = this.db
      .selectFrom("webhook_key")
      .selectAll("webhook_key")
      .where("session_id", "=", sessionId)

    if (isRevoked !== null) result = result.where("is_revoked", "=", isRevoked);

    return await result.execute();
  }

  async getLatestActiveWebhookKeyBySessionId(sessionId: number) {
    const result = await this.db
      .selectFrom("webhook_key")
      .selectAll("webhook_key")
      .where("session_id", "=", sessionId)
      .where("is_revoked", "=", false)
      .orderBy("created_at", "desc")
      .executeTakeFirst();

    return result;
  }

  async updateWebhookByWebhookKeyId(
    webhookKeyId: number,
    updateParams: WebhookKeyUpdate,
    trx?: Transaction<SessionDatabase>,
  ) {
    const currentTimestamp = new Date();
    const result = await (trx ? trx : this.db)
      .updateTable("webhook_key")
      .set({
        ...updateParams,
        updated_at: currentTimestamp.toISOString(),
      })
      .where("webhook_key_id", "=", webhookKeyId)
      .returningAll()
      .executeTakeFirst();

    return result;
  }
}
