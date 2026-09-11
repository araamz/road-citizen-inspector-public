import * as z from "zod";

const UPDATED_SESSION_SCHEMA = z.object({
  title: z.string().min(10).max(50).optional(),
  description: z.string().min(20).max(100).optional(),
});

export { UPDATED_SESSION_SCHEMA };
export type UpdatedSessionSchema = z.infer<typeof UPDATED_SESSION_SCHEMA>;
