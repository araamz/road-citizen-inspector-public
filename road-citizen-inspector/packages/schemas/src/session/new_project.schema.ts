import { z } from "zod"

const NEW_PROJECT_SCHEMA = z.object({
    session_id: z.number(),
    tts_app_id: z.string().nonempty()
})

export { NEW_PROJECT_SCHEMA }
export type NewProjectSchema = z.infer<typeof NEW_PROJECT_SCHEMA>