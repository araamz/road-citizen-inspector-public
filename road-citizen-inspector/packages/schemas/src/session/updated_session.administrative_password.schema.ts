import { z } from "zod";
import { PRIMITIVE_CREDENTIAL_SCHEMA } from "../primitive.schema.js";

const UPDATED_SESSION_ADMINISTRATIVE_PASSWORD_SCHEMA = z.object({
  administrative_password: PRIMITIVE_CREDENTIAL_SCHEMA,
});

export { UPDATED_SESSION_ADMINISTRATIVE_PASSWORD_SCHEMA };
export type UpdatedSessionAdministrativePasswordSchema = z.infer<
  typeof UPDATED_SESSION_ADMINISTRATIVE_PASSWORD_SCHEMA
>;
