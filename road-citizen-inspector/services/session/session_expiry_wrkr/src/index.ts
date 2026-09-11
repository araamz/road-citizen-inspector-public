import { sessionExpiryClient } from "./connectors/session_expiry_client.js";
import db from "./connectors/kysely.js";
import {
  SessionDatabase,
  SessionModel,
} from "@road-citizen-inspector/models/session";
import { Kysely } from "kysely";

const expireSession = async (
  database: Kysely<SessionDatabase>,
  sessionId: number,
) => {
  const sessionModel = new SessionModel(database);

  const session = await sessionModel.getSessionBySessionId(sessionId);

  if (!session) {
    console.error("Session is not found. Failed to expire the session.");
    return false;
  }

  if (session.status === "claimed") {
    console.error("Session is already claimed. Failed to expire the session.");
    return false;
  }

  return sessionModel
    .updateSessionBySessionId(sessionId, {
      status: "expired",
    })
    .then((expiredSession) => {
      if (!expiredSession) {
        throw new Error(
          "Session is not updated. Failed to expire the session.",
        );
      }
      console.log("Session successfully updated.", expiredSession);
      return true;
    });
};

await sessionExpiryClient
  .init()
  .then(() => {
    console.log("Connection established to Exchange Queue.");
  })
  .catch((error) => {
    console.error("Connection not established to Exchange Queue.", error);
  });

sessionExpiryClient.receiveSession(({ session_id }) =>
  expireSession(db, session_id),
);
