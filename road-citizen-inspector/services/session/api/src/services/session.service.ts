import type { SessionModel } from "@road-citizen-inspector/models";
import type { Session, SessionUpdate } from "@road-citizen-inspector/models";
import type { PasswordStrategy } from "@road-citizen-inspector/password-strategy";
import Service, { ServiceError } from "./service.js";
import { SessionExpiryClient } from "@road-citizen-inspector/session-expiry-jobs";

export default class SessionService extends Service {
  private sessionModel: SessionModel;
  private ps: PasswordStrategy;
  private ec: SessionExpiryClient;

  constructor(
    sessionModel: SessionModel,
    passwordStrategy: PasswordStrategy,
    expiryClient: SessionExpiryClient
  ) {
    super();
    this.sessionModel = sessionModel;
    this.ps = passwordStrategy;
    this.ec = expiryClient;
  }

  private SessionGenerationError(
    message: string,
    sessionParams: Pick<Session, "title" | "description">
  ) {
    return new ServiceError<Pick<Session, "title" | "description">>(
      message,
      "session_generation_failed",
      sessionParams
    );
  }

  private SessionNotDeletedError(message: string, session: Session) {
    return new ServiceError<Session>(message, "session_not_deleted", session);
  }

  private SessionNotFoundError(
    message: string,
    sessionId: Pick<Session, "session_id">
  ) {
    return new ServiceError<Pick<Session, "session_id">>(
      message,
      "session_not_found",
      sessionId
    );
  }

  private SessionUpdateError(
    message: string,
    session: Omit<
      Session,
      "password" | "salt" | "administrative_password" | "administrative_salt"
    >
  ) {
    return new ServiceError<
      Omit<
        Session,
        "password" | "salt" | "administrative_password" | "administrative_salt"
      >
    >(message, "session_update_failed", session);
  }

  async generateNewSession(
    title: string,
    description: string,
    password: string | null,
    visibility: "public" | "private",
    administrative_password: string
  ) {
    const securePassword = password ? this.ps.hash(password) : null;
    const secureAdministrativePassword = this.ps.hash(administrative_password);
    return this.sessionModel
      .createSession({
        title: title,
        description: description,
        visibility: visibility,
        administrative_password: secureAdministrativePassword.hash,
        administrative_salt: secureAdministrativePassword.salt,
        password: securePassword ? securePassword.hash : null,
        salt: securePassword ? securePassword.salt : null,
      })
      .then((session) => {
        if (!session) {
          throw this.SessionGenerationError("Failed to generate session.", {
            title,
            description,
          });
        }

        this.ec.sendSession({
          session_id: session.session_id,
        });
        return session;
      });
  }

  async removeSession(sessionId: number) {
    return this.sessionModel
      .getSessionBySessionId(sessionId)
      .then((session: Session | undefined) => {
        if (!session)
          throw this.SessionNotFoundError(
            "Session is not found. Removing session has failed.",
            {
              session_id: sessionId,
            }
          );

        return session;
      })
      .then(async (session: Session) => {
        const removedSession = await this.sessionModel.removeSessionBySessionId(
          session.session_id
        );

        if (!removedSession)
          throw this.SessionNotDeletedError(
            "Unknown error occurred removing session. Removing session has failed.",
            session
          );

        return removedSession;
      });
  }

  async getSession(sessionId: number) {
    return this.sessionModel
      .getSessionBySessionId(sessionId)
      .then((session: Session | undefined) => {
        if (!session)
          throw this.SessionNotFoundError(
            "Session was not found. Retrieving session has failed.",
            {
              session_id: sessionId,
            }
          );

        return session;
      });
  }

  async makeSessionPrivate(sessionId: number, password: string) {
    return this.sessionModel
      .getSessionBySessionId(sessionId)
      .then((session: Session | undefined) => {
        if (!session)
          throw this.SessionNotFoundError(
            "Session was not found. Making session private has failed.",
            {
              session_id: sessionId,
            }
          );

        return session;
      })
      .then(async (session: Session) => {
        const securePassword = this.ps.hash(password);

        const updatedSession = await this.sessionModel.updateSessionBySessionId(
          session.session_id,
          {
            visibility: "private",
            salt: securePassword.salt,
            password: securePassword.hash,
          }
        );

        if (!updatedSession)
          throw this.SessionUpdateError(
            "Session has not been updated. Making session private has failed.",
            session
          );

        return updatedSession;
      });
  }

  async makeSessionPublic(sessionId: number) {
    return this.sessionModel
      .getSessionBySessionId(sessionId)
      .then((session: Session | undefined) => {
        if (!session)
          throw this.SessionNotFoundError(
            "Session was not found. Making session public has failed.",
            {
              session_id: sessionId,
            }
          );

        return session;
      })
      .then(async (session: Session) => {
        const updatedSession = await this.sessionModel.updateSessionBySessionId(
          session.session_id,
          {
            password: null,
            salt: null,
            visibility: "public",
          }
        );

        if (!updatedSession)
          throw this.SessionUpdateError(
            "Session has not been updated. Making session public has failed.",
            session
          );

        return updatedSession;
      });
  }

  async updateSession(
    sessionId: number,
    update: Pick<SessionUpdate, "title" | "description">
  ) {
    return this.sessionModel
      .getSessionBySessionId(sessionId)
      .then((session: Session | undefined) => {
        if (!session)
          throw this.SessionNotFoundError(
            "Session was not found. Updating session has failed.",
            {
              session_id: sessionId,
            }
          );

        return session;
      })
      .then(async (session: Session) => {
        const updatedSession = await this.sessionModel.updateSessionBySessionId(
          session.session_id,
          {
            title: update.title,
            description: update.description,
          }
        );

        if (!updatedSession)
          throw this.SessionUpdateError(
            "Session has not been updated. Updating session has failed.",
            session
          );

        return updatedSession;
      });
  }

  async updateAdministrativePassword(sessionId: number, password: string) {
    return this.sessionModel
      .getSessionBySessionId(sessionId)
      .then((session: Session | undefined) => {
        if (!session)
          throw this.SessionNotFoundError(
            "Session was not found. Updating session has failed.",
            {
              session_id: sessionId,
            }
          );

        return session;
      })
      .then(async (session: Session) => {
        const secureAdministrativePassword = this.ps.hash(password);
        const updatedSession = await this.sessionModel.updateSessionBySessionId(
          session.session_id,
          {
            administrative_password: secureAdministrativePassword.hash,
            administrative_salt: secureAdministrativePassword.salt,
          }
        );

        if (!updatedSession)
          throw this.SessionUpdateError(
            "Session has not been updated. Updating session has failed.",
            session
          );

        return updatedSession;
      });
  }

  // generateNewSession - I - I
  // claimSession - I - P
  // removeSession - I - I
  // getSession - I - I
  // makeSessionPublic - I - I
  // makeSessionPrivate - I - I
  // updateAdminstrativePassword
}
