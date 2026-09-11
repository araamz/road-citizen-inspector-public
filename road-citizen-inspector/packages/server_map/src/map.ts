// packages/server-map/src/map.ts
import {
  createServerMap,
  type ServerMap,
  type ServiceKey,
  type GatewayKey,
} from "./index.js";

const serverMap = createServerMap<ServiceKey, GatewayKey>({
  services: {
    RCI_GATEWAT_API: {
      env: "RCI_GATEWAY_API_ADDR",
      default: "http://gateway_api:4000",
    },
    RCI_SESSION_API: {
      env: "RCI_SESSION_API_ADDR",
      default: "http://session_api:4001",
    },
    RCI_UPLINK_API: {
      env: "RCI_UPLINK_API_ADDR",
      default: "http://uplink_api:4002",
    },
    RCI_BATCH_API: {
      env: "RCI_BATCH_API_ADDR",
      default: "http://batch_api:4003",
    },
    APP_RABBITMQ: {
      env: "APP_RABBITMQ_ADDR",
      default: "amqp://rci:cyrus@app_rabbitmq:5672",
    },
    APP_REDIS: {
      env: "APP_REDIS_ADDR",
      default: "redis://app_redis:6379",
    },
  },
  gateways: {
    APP_EXT_NGINX: {
      env: "APP_EXT_NGINX_ADDR",
      default: "http://app_ext_nginx:80",
    }
  },
});

export type RCIServerMap = ServerMap<ServiceKey, GatewayKey>;
export { serverMap };