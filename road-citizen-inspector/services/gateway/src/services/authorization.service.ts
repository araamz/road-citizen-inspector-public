import { Session, SessionModel } from "@road-citizen-inspector/models";
import Service, { ServiceError } from "./service.js";
import { PasswordStrategy } from "@road-citizen-inspector/password-strategy";
import { Redis } from "ioredis";

export type SessionEntryData = {
  session_id: number;
  project_id: number | null;
  role: "viewer" | "administrator";
};

export class AuthorizationService extends Service {
  private sessionModel: SessionModel;
  private redisClient: Redis;
  private passwordStrategy: PasswordStrategy;
  private sessionEntryExpSeconds: number;

  constructor(
    sessionModel: SessionModel,
    redisClient: Redis,
    passwordStrategy: PasswordStrategy,
    sessionEntryExpSeconds: number = 3600
  ) {
    super();
    this.sessionModel = sessionModel;
    this.redisClient = redisClient;
    this.passwordStrategy = passwordStrategy;
    this.sessionEntryExpSeconds = sessionEntryExpSeconds;
  }

  private SessionAdministrativeCredentialError(message: string) {
    return new ServiceError(
      `An error occurred while verifying administrative credentials for session. ${message}`,
      "session_administrative_credential_error"
    );
  }

  private SessionCredentialError(message: string) {
    return new ServiceError(
      `An error occurred while verifying session credentials. ${message}`,
      "session_credential_error"
    );
  }

  private SessionGenerationError(message: string) {
    return new ServiceError(
      `An error occurred while generating the session. ${message}`,
      "session_generation_error"
    );
  }

  private SessionRevokeError(message: string) {
    return new ServiceError(
      `An error occurred while revoking the session. ${message}`,
      "session_revoke_error"
    );
  }

  private SessionVerificationError(
    message: string,
    details: Pick<Session, "session_id">
  ) {
    return new ServiceError(
      `Session verification failed. ${message}`,
      "session_verification_error",
      details
    );
  }

  async verifyAdministrativeSession(
    sessionId: number,
    administrativePassword: string
  ) {
    return this.sessionModel
      .getSessionBySessionId(sessionId)
      .then((session) => {
        if (!session)
          throw this.SessionVerificationError(
            "Session was not found or is invalid.",
            { session_id: sessionId }
          );
        return session;
      })
      .then(async (session) => {
        const credentialsValid = await this.verifyPrivilegedCredentials(
          sessionId,
          administrativePassword
        );

        if (!credentialsValid)
          throw this.SessionAdministrativeCredentialError(
            "Administrative credentials for this session are invalid."
          );
        return session;
      });
  }

  async verifyPrivateSession(sessionId: number, password: string) {
    return this.sessionModel
      .getSessionBySessionId(sessionId)
      .then((session) => {
        if (!session)
          throw this.SessionVerificationError(
            "Session was not found or is invalid.",
            { session_id: sessionId }
          );

        if (session.visibility === "public")
          throw this.SessionCredentialError(
            "Session is public and does not require credentails."
          );
        return session;
      })
      .then(async (session) => {
        const credentialsValid = await this.verifySessionCredentials(
          sessionId,
          password
        );

        if (!credentialsValid)
          throw this.SessionCredentialError("Session credentials are invalid");
        return session;
      });
  }

  async verifyPublicSession(sessionId: number) {
    return this.sessionModel
      .getSessionBySessionId(sessionId)
      .then((session) => {
        if (!session)
          throw this.SessionVerificationError(
            "Session was not found or is invalid.",
            { session_id: sessionId }
          );

        if (session.visibility === "private")
          throw this.SessionCredentialError(
            "Credentails required for private session."
          );
        return session;
      });
  }

  async saveSessionEntry(sid: string, data: SessionEntryData) {
    return await this.redisClient
      .set(`session:${sid}`, JSON.stringify(data))
      .then((isStored) => {
        if (!isStored)
          throw this.SessionGenerationError("Failed to store session data.");
        return sid;
      })
      .then(() => {
        this.redisClient.expire(`session:${sid}`, this.sessionEntryExpSeconds);
      });
  }

  async getSessionEntry(sid: string) {
    console.log("Getting session entry for SID:", sid);
    return await this.redisClient.get(`session:${sid}`).then((data) => {
      if (!data) return null;
      return JSON.parse(data) as SessionEntryData;
    });
  }

  async revokeSessionEntry(sid: string) {
    return await this.redisClient.del(`session:${sid}`).then((result) => {
      if (result === 0)
        throw this.SessionRevokeError("Failed to remove the session.");
      return result;
    });
  }

  async verifyPrivilegedCredentials(
    sessionId: number,
    administrativePassword: string
  ): Promise<boolean> {
    const session = await this.sessionModel.getSessionBySessionId(sessionId);

    if (!session) return false;

    const isPasswordValid = this.passwordStrategy.compare(
      administrativePassword,
      session.administrative_password,
      session.administrative_salt
    );

    return isPasswordValid;
  }

  async verifySessionCredentials(
    sessionId: number,
    password: string
  ): Promise<boolean> {
    const session = await this.sessionModel.getSessionBySessionId(sessionId);

    if (!session)
      throw this.SessionCredentialError("Session is not found or is invalid.");

    if (!session.password || !session.salt)
      throw this.SessionCredentialError(
        "An unexpected error occurred reading session credentials."
      );

    const isPasswordValid = this.passwordStrategy.compare(
      password,
      session.password,
      session.salt
    );

    return isPasswordValid;
  }

  async getSession(
    sessionId: number
  ): Promise<Session> {
        const session = await this.sessionModel.getSessionBySessionId(sessionId);

    if (!session)
      throw this.SessionCredentialError("Session is not found or is invalid.");

    return session;
  }
}
