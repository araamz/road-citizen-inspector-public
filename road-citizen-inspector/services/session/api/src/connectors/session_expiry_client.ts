import { SessionExpiryClient } from "@road-citizen-inspector/session-expiry-jobs";
import { serverMap } from "@road-citizen-inspector/server-map/map"

const sessionExpiryClient = new SessionExpiryClient({
  url: serverMap.services.APP_RABBITMQ,
  exchange: "session-exchange",
  queue: "expiry-msgs",
  expirationMs: 60 * 60 * 24 * 1000,
  messagesPersistent: true,
  queuesDurable: true,
});

sessionExpiryClient
  .init()
  .then(() => {
    console.log("Connection established to Exchange Queue.");
  })
  .catch((error) => {
    console.error("Connection not established to Exchange Queue.", error);
    process.exit(1);
  });

export { sessionExpiryClient };
