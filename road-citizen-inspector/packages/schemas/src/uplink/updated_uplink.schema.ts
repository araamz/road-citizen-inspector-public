import { z } from "zod";
import { PRIMITIVE_UPLINK_STATUS_SCHEMA } from "../primitive.schema.js";

const UPDATED_UPLINK_SCHEMA = z.object({
  status: PRIMITIVE_UPLINK_STATUS_SCHEMA,
});

export { UPDATED_UPLINK_SCHEMA };
export type UpdatedUplinkSchema = z.infer<typeof UPDATED_UPLINK_SCHEMA>;
