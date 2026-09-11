import { z } from "zod";
import {
  PRIMITIVE_CREDENTIAL_SCHEMA,
  PRIMITIVE_SESSION_VISIBILITY_SCHEMA,
} from "../primitive.schema.js";

const UPDATED_SESSION_VISIBILITY_SCHEMA = z
  .object({
    visibility: PRIMITIVE_SESSION_VISIBILITY_SCHEMA,
    password: PRIMITIVE_CREDENTIAL_SCHEMA.optional(),
  })
  .refine(
    (data) =>
      (data.visibility === "private" && !!data.password) ||
      (data.visibility === "public" && !data.password),
    {
      message: "invalid_password_visibility_combination",
      path: ["password"],
    },
  );

export { UPDATED_SESSION_VISIBILITY_SCHEMA };
export type UpdatedSessionVisibilitySchema = z.infer<
  typeof UPDATED_SESSION_VISIBILITY_SCHEMA
>;
