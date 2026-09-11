import { Redis } from "ioredis";
import { serverMap } from "@road-citizen-inspector/server-map/map";

const redisClient: Redis = new Redis(serverMap.services.APP_REDIS).on("error", (err) => {
  console.error("Redis connection error:", err);
  process.exit(1)
}).on("connect", () => {
  console.log("Connected to Redis successfully.");
});


export { redisClient };