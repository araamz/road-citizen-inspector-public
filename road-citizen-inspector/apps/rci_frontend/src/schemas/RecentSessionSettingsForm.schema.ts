import { z } from 'zod'

const RECENT_SESSION_SETTINGS_FORM = z.object({
    is_favorite: z.boolean(),
    personalized_name: z.string().trim().max(50).optional(),
})

export {RECENT_SESSION_SETTINGS_FORM}
export type RecentSessionSettingsFormSchema = z.infer<typeof RECENT_SESSION_SETTINGS_FORM>