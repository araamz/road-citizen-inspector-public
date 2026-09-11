import * as z from "zod";
import {
  PRIMITIVE_CREDENTIAL_SCHEMA,
  PRIMITIVE_SESSION_VISIBILITY_SCHEMA,
} from "../primitive.schema.js";

const NEW_SESSION_SCHEMA = z
  .object({
    title: z.string().min(10).max(50),
    description: z.string().min(20).max(150),
    password: PRIMITIVE_CREDENTIAL_SCHEMA.optional(),
    visibility: PRIMITIVE_SESSION_VISIBILITY_SCHEMA,
    administrative_password: PRIMITIVE_CREDENTIAL_SCHEMA,
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

export { NEW_SESSION_SCHEMA };
export type NewSessionSchema = z.infer<typeof NEW_SESSION_SCHEMA>;
