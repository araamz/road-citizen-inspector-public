import type {
  ColumnType,
  Generated,
  Insertable,
  Kysely,
  Selectable,
  Updateable,
} from "kysely";
import type { Transaction } from "kysely";
import { Model } from "../model.js";
import type { SessionDatabase } from "./session.database.js";

export type SessionVisibilityStatus = "public" | "private";
export type SessionClaimStatus = "claimed" | "unclaimed" | "expired";

export interface SessionTable {
  session_id: Generated<number>;
  title: string;
  description: string;
  status: SessionClaimStatus;
  project_id: ColumnType<number, never, number>;
  tts_app_id: ColumnType<string | null, never, string>;
  visibility: SessionVisibilityStatus;
  password: ColumnType<string, string | null, string | null>;
  salt: ColumnType<string, string | null, string | null>;
  administrative_password: string;
  administrative_salt: string;
  is_deleted: ColumnType<boolean, false, boolean>;
  created_at: ColumnType<string, string, never>;
  updated_at: ColumnType<string | null, never, string>;
  active_at: ColumnType<string | null, never, string>;
}

export type Session = Selectable<SessionTable>;
export type NewSession = Insertable<SessionTable>;
export type SessionUpdate = Updateable<SessionTable>;

export class SessionModel extends Model<SessionDatabase> {
  constructor(kyselyObject: Kysely<SessionDatabase>) {
    super(kyselyObject);
  }

  async createSession(
    params: Pick<
      NewSession,
      | "password"
      | "salt"
      | "visibility"
      | "administrative_password"
      | "administrative_salt"
      | "title"
      | "description"
    >,
    trx?: Transaction<SessionDatabase>
  ) {
    const current_timestamp = new Date();

    const result = await (trx ? trx : this.db)
      .insertInto("session")
      .values({
        title: params.title,
        description: params.description,
        status: "unclaimed",
        visibility: params.visibility,
        password: params.password,
        salt: params.salt,
        administrative_password: params.administrative_password,
        administrative_salt: params.administrative_salt,
        created_at: current_timestamp.toUTCString(),
        is_deleted: false,
      })
      .returning([
        "session_id",
        "title",
        "description",
        "status",
        "visibility",
        "project_id",
        "tts_app_id",
        "created_at",
        "updated_at",
        "active_at",
      ])
      .executeTakeFirst();

    return result;
  }

  async getSessionBySessionId(sessionId: number) {
    const current_timestamp = new Date();

    const result = await this.db
      .selectFrom("session")
      .selectAll("session")
      .where("session_id", "=", sessionId)
      .where("is_deleted", "=", false)
      .executeTakeFirst();
    this.db
      .updateTable("session")
      .set({
        active_at: current_timestamp.toUTCString(),
      })
      .where("session_id", "=", sessionId)
      .where("status", "!=", "expired")
      .execute();

    return result;
  }

  async updateSessionBySessionId(
    sessionId: number,
    updateParams: Omit<SessionUpdate, "is_deleted" | "updated_at">,
    trx?: Transaction<SessionDatabase>
  ) {
    const current_timestamp = new Date();

    console.log({
      ...updateParams,
      updated_at: current_timestamp.toUTCString(),
    });
    const result = await (trx ? trx : this.db)
      .updateTable("session")
      .set({
        ...updateParams,
        updated_at: current_timestamp.toUTCString(),
      })
      .where("session_id", "=", sessionId)
      .returning([
        "session_id",
        "title",
        "description",
        "status",
        "visibility",
        "project_id",
        "tts_app_id",
        "created_at",
        "updated_at",
        "active_at",
      ])
      .executeTakeFirst();

    return result;
  }

  async removeSessionBySessionId(
    sessionId: number,
    trx?: Transaction<SessionDatabase>
  ) {
    const result = await (trx ? trx : this.db)
      .updateTable("session")
      .set({
        is_deleted: true,
      })
      .where("session_id", "=", sessionId)
      .returning([
        "session_id",
        "title",
        "description",
        "status",
        "visibility",
        "project_id",
        "tts_app_id",
        "created_at",
        "updated_at",
        "active_at",
        "is_deleted",
      ])
      .executeTakeFirst();

    return result;
  }
}
