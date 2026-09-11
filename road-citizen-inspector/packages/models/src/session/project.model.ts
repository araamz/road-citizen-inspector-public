import type {
  ColumnType,
  Generated,
  Insertable,
  Kysely,
  Selectable,
  Updateable,
} from "kysely";
import { Model } from "./../model.js";
import type { Transaction } from "kysely";
import type { SessionDatabase } from "./session.database.js";

export interface ProjectTable {
  project_id: Generated<number>;
  session_id: ColumnType<number, number | null, number>;
  tts_app_id: ColumnType<string, string | null, string>;
  created_at: ColumnType<string, string, never>;
  updated_at: ColumnType<string, never, string>;
}

export type Project = Selectable<ProjectTable>;
export type NewProject = Insertable<ProjectTable>;
export type ProjectUpdate = Updateable<ProjectTable>;

export class ProjectModel extends Model<SessionDatabase> {
  constructor(kyselyObject: Kysely<SessionDatabase>) {
    super(kyselyObject);
  }

  async createProject(
    params: Pick<NewProject, "session_id" | "tts_app_id">,
    trx?: Transaction<SessionDatabase>,
  ) {
    const currentTimestamp = new Date();

    const result = await (trx ? trx : this.db)
      .insertInto("project")
      .values({
        ...params,
        created_at: currentTimestamp.toISOString(),
      })
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async getProjectByProjectId(projectId: number) {
    const result = await this.db
      .selectFrom("project")
      .selectAll()
      .where("project_id", "=", projectId)
      .executeTakeFirst();

    return result;
  }

  async getProjectBySessionId(sessionId: number) {
    const result = await this.db
      .selectFrom("project")
      .selectAll()
      .where("session_id", "=", sessionId)
      .executeTakeFirst();

    return result;
  }

  async updateProjectByProjectId(
    projectId: number,
    updateParams: Omit<ProjectUpdate, "updated_at">,
    trx?: Transaction<SessionDatabase>,
  ) {
    const currentTimestamp = new Date();

    const result = await (trx ? trx : this.db)
      .updateTable("project")
      .set({
        ...updateParams,
        updated_at: currentTimestamp.toISOString(),
      })
      .where("project_id", "=", projectId)
      .executeTakeFirst();

    return result;
  }
}
