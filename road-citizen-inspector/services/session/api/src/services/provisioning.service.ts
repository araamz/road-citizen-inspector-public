import {
  NewProject,
  NewSession,
  Project,
  ProvisioningModel,
  Session,
} from "@road-citizen-inspector/models";
import Service, { ServiceError } from "./service.js";
import SessionService from "./session.service.js";
import { PasswordStrategy } from "@road-citizen-inspector/password-strategy";
import { randomUUID } from "node:crypto";
import { SessionExpiryClient } from "@road-citizen-inspector/session-expiry-jobs";

export default class ProvisioningService extends Service {
  private provisioningModel: ProvisioningModel;
  private sessionService: SessionService;
  private ps: PasswordStrategy;
  private ec: SessionExpiryClient;

  constructor(
    provisioningModel: ProvisioningModel,
    sessionService: SessionService,
    passwordStrategy: PasswordStrategy,
    expiryClient: SessionExpiryClient
  ) {
    super();
    this.provisioningModel = provisioningModel;
    this.sessionService = sessionService;
    this.ps = passwordStrategy;
    this.ec = expiryClient;
  }

  private SessionGenerationError(
    message: string,
    details: Pick<NewSession, "title" | "description" | "visibility">,
  ) {
    return new ServiceError(message, "session_generation_failed", details);
  }

  private SessionClaimingError(
    message: string,
    details: Pick<NewProject, "project_id" | "session_id" | "tts_app_id">,
  ) {
    return new ServiceError(message, "session_claim_failure", details);
  }

  async claimSession(
    sessionId: number,
    ttsAppId: string,
  ): Promise<{
    project: Project;
    session: Session;
  }> {
    return this.sessionService
      .getSession(sessionId)
      .then((session: Session) => {
        if (session.status === "claimed")
          throw this.SessionClaimingError(
            "The session is already claimed. Failed to claim session.",
            {
              session_id: sessionId,
              tts_app_id: ttsAppId,
            },
          );

        if (session.status === "expired")
          throw this.SessionClaimingError(
            "The session is expired. Failed to claim session.",
            {
              session_id: sessionId,
              tts_app_id: ttsAppId,
            },
          );

        return this.provisioningModel.createSessionClaim({
          session_id: session.session_id,
          tts_app_id: ttsAppId,
        });
      })
      .then(async (createdProject) => {
        if (!createdProject)
          throw this.SessionClaimingError(
            "An error occured creating a project. Failed to claim session.",
            {
              session_id: sessionId,
              tts_app_id: ttsAppId,
            },
          );

        const claimedSession = await this.sessionService.getSession(sessionId);

        return {
          project: createdProject,
          session: claimedSession,
        };
      });
  }

  async generateNewSessionComposite(
    title: string,
    description: string,
    password: string | null,
    visibility: "public" | "private",
    administrative_password: string,
  ) {
    const hashedKey = randomUUID();
    const securePassword = password ? this.ps.hash(password) : null;
    const secureAdministrativePassword = this.ps.hash(administrative_password);
    return this.provisioningModel
      .provisionNewSession(
        {
          title: title,
          description: description,
          visibility: visibility,
          administrative_password: secureAdministrativePassword.hash,
          administrative_salt: secureAdministrativePassword.salt,
          password: securePassword ? securePassword.hash : null,
          salt: securePassword ? securePassword.salt : null
        },
        hashedKey,
      ).then(({session, webhookKey}) => {
        this.ec.sendSession({
          session_id: session.session_id
        })
        return { session, webhookKey }
      })
      .catch((error) => {
        throw this.SessionGenerationError(
          `${error.message ?? "An error occurred generating the session."}. Session generation has failed.`,
          {
            title,
            description,
            visibility,
          },
        );
      });
  }
}
