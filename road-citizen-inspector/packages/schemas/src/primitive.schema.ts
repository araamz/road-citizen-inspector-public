import { z } from "zod";
import { boolean } from "zod/v4";

// Password Requirements:
// - At least 8 characters long
// - At most 32 characters long
// - Contains at least one lowercase letter
// - Contains at least one uppercase letter
// - Contains at least one digit
// - Contains at least one special character (#@$!%*?&)

export const PRIMITIVE_CREDENTIAL_SCHEMA = z
  .string()
  .min(8)
  .max(32)
  .trim()
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,32}$/
  );

export const PRIMITIVE_SESSION_VISIBILITY_SCHEMA = z.enum([
  "public",
  "private",
]);

export const PRIMITIVE_UPLINK_STATUS_SCHEMA = z.enum([
  "unprocessed",
  "processed",
  "failed",
]);

export const PRIMITIVE_SORT_ORDER_SCHEMA = z.enum(["asc", "dsc"]);
