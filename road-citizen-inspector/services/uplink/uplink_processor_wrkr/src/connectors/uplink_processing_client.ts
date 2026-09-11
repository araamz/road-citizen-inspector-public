import { UplinkProcessorClient } from "@road-citizen-inspector/uplink-processing-jobs";
import { serverMap } from "@road-citizen-inspector/server-map/map";

const uplinkProcessorClient = new UplinkProcessorClient({
  url: serverMap.services.APP_RABBITMQ,
  exchange: "uplink-exchange",
  queue: "uplink-processing-msgs",
  messagesPersistent: true,
  queuesDurable: true,
});

export { uplinkProcessorClient };
