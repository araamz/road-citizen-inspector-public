import { z } from "zod";

const RANGED_CREATED_AT_SCHEMA = z.object({
  start_created_at: z.string().optional().nullable(),
  end_created_at: z.string().optional().nullable(),
});

export {RANGED_CREATED_AT_SCHEMA}
export type RangedCreatedAtSchema = z.infer<typeof RANGED_CREATED_AT_SCHEMA>