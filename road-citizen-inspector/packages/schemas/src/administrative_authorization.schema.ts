import { z } from "zod";

const ADMINISTRATIVE_AUTHORIZATION_SCHEMA = z.object({
  cred_session_id: z.number(),
  cred_administrative_password: z
    .string()
    .nonempty("Administrative password is required."),
});

export {ADMINISTRATIVE_AUTHORIZATION_SCHEMA}
export type AdministrativeAuthorizationSchema = z.infer<typeof ADMINISTRATIVE_AUTHORIZATION_SCHEMA>