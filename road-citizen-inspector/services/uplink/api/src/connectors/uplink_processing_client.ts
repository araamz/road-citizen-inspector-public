import { UplinkProcessorClient } from "@road-citizen-inspector/uplink-processing-jobs";
import { serverMap } from "@road-citizen-inspector/server-map/map"

const uplinkProcessorClient = new UplinkProcessorClient({
  url: serverMap.services.APP_RABBITMQ,
  exchange: "uplink-exchange",
  queue: "uplink-processing-msgs",
  messagesPersistent: true,
  queuesDurable: true,
});

uplinkProcessorClient
  .init()
  .then(() => {
    console.log("Connection established to Exchange Queue.");
  })
  .catch((error) => {
    console.error("Connection not established to Exchange Queue.", error);
    process.exit(1);
  });

export { uplinkProcessorClient };
