import * as z from "zod"

const DEVICE_CONFIG_LINK_SCHEMA = z.object({
    config_reading_id: z.number()
})

export { DEVICE_CONFIG_LINK_SCHEMA }
export type DeviceConfigLinkSchema = z.infer<typeof DEVICE_CONFIG_LINK_SCHEMA>