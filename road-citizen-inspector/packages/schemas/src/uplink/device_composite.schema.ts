import { z } from "zod"

const DEVICE_COMPOSITE_SCHEMA = z.object({
    project_id: z.coerce.number(),
    tts_device_id: z.string().nonempty()
})

export { DEVICE_COMPOSITE_SCHEMA }
export type DeviceCompositeSchema = z.infer<typeof DEVICE_COMPOSITE_SCHEMA>

