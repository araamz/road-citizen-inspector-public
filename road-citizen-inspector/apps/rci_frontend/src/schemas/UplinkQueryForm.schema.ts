import { z } from 'zod';

const UPLINK_QUERY_FORM_SCHEMA = z.object({
    created_at_start: z.coerce.date().nullish(),
    created_at_end: z.coerce.date().nullish(),
    updated_at_start: z.coerce.date().nullish(),
    updated_at_end: z.coerce.date().nullish(),
    sort_order: z.enum(['asc', 'desc']).nullish(),
    processed: z.coerce.boolean().nullish(),
    unprocessed: z.coerce.boolean().nullish(),
    failed: z.coerce.boolean().nullish(),
    page: z.coerce.number().nullish(),
    size: z.coerce.number().nullish(),
})

export { UPLINK_QUERY_FORM_SCHEMA };
export type UplinkQueryFormSchema = z.infer<typeof UPLINK_QUERY_FORM_SCHEMA>