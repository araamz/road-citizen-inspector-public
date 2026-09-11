import { z } from "zod";

const PUBLIC_AUTHORIZATION_SCHEMA = z.object({
  cred_session_id: z.number(),
});

export {PUBLIC_AUTHORIZATION_SCHEMA}
export type PublicAuthorizationSchema = z.infer<typeof PUBLIC_AUTHORIZATION_SCHEMA>