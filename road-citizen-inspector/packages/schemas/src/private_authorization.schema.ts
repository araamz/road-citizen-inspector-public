import { z } from "zod";

const PRIVATE_AUTHORIZATION_SCHEMA = z.object({
  cred_session_id: z.number(),
  cred_password: z
    .string()
    .nonempty("Password is required."),
});

export {PRIVATE_AUTHORIZATION_SCHEMA}
export type PrivateAuthorizationSchema = z.infer<typeof PRIVATE_AUTHORIZATION_SCHEMA>