import * as z from "zod";

const UPDATED_DEVICE_SCHEMA = z.object({
    is_pinned: z.boolean().optional().nullable(),
    is_hidden: z.boolean().optional().nullable(),
    label: z.string().max(100).optional().nullable(),
    description: z.string().optional().nullable()
})

export { UPDATED_DEVICE_SCHEMA }
export type UpdatedDeviceSchema = z.infer<typeof UPDATED_DEVICE_SCHEMA>