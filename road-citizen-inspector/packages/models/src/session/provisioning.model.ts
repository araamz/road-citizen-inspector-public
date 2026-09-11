import type { Kysely } from "kysely";
import type { NewProject, ProjectModel } from "./project.model.js";
import type { WebhookKeyModel } from "./webhook_key.model.js";
import type { NewSession, SessionModel } from "./session.model.js";
import type { SessionDatabase } from "./session.database.js";
import { Model } from "../model.js";

export class ProvisioningModel extends Model<SessionDatabase> {
  private sessionModel: SessionModel;
  private projectModel: ProjectModel;
  private webhookKeyModel: WebhookKeyModel;

  constructor(
    kyselyObject: Kysely<SessionDatabase>,
    sessionModel: SessionModel,
    projectModel: ProjectModel,
    webhookKeyModel: WebhookKeyModel,
  ) {
    super(kyselyObject);
    this.sessionModel = sessionModel;
    this.projectModel = projectModel;
    this.webhookKeyModel = webhookKeyModel;
  }

  public async createSessionClaim(
    projectParams: Pick<NewProject, "session_id" | "tts_app_id">,
  ) {
    const result = await this.db.transaction().execute(async (trx) => {
      const newProject = await this.projectModel.createProject(
        projectParams,
        trx,
      );

      if (!newProject) {
        throw new Error("Transaction failed to create project.");
      }

      const _updatedSession = await this.sessionModel.updateSessionBySessionId(
        newProject.session_id,
        {
          status: "claimed",
          project_id: newProject.project_id,
          tts_app_id: newProject.tts_app_id
        },
        trx,
      );

      return newProject;
    });

    return result;
  }

  public async provisionNewSession(
    sessionParams: Pick<
      NewSession,
      | "password"
      | "salt"
      | "visibility"
      | "administrative_password"
      | "administrative_salt"
      | "title"
      | "description"
    >,
    hashedKey: string,
  ) {
    const result = await this.db.transaction().execute(async (trx) => {
      const createdSession = await this.sessionModel.createSession(
        sessionParams,
        trx,
      );

      if (!createdSession) {
        throw new Error("Transaction failed to create session.");
      }

      const createdWebhookKey = await this.webhookKeyModel.createWebhookKey(
        {
          session_id: createdSession.session_id,
          hashed_key: hashedKey,
          is_revoked: false,
        },
        trx,
      );

      if (!createdWebhookKey) {
        throw new Error("Transaction failed to create webhook key.");
      }

      return {
        session: createdSession,
        webhookKey: createdWebhookKey,
      };
    });

    return result;
  }
}
