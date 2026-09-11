import { z } from "zod";

const RANGED_UPDATED_AT_SCHEMA = z.object({
  start_updated_at: z.string().optional().nullable(),
  end_updated_at: z.string().optional().nullable(),
});

export {RANGED_UPDATED_AT_SCHEMA};
export type RangedUpdatedAtSchema = z.infer<typeof RANGED_UPDATED_AT_SCHEMA>