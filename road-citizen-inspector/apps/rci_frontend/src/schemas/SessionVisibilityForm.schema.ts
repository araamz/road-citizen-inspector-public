import { z } from 'zod'
import { UPDATED_SESSION_VISIBILITY_SCHEMA } from '@road-citizen-inspector/schemas'

const CONFIRMATION_FIELDS_SCHEMA = z.object({
  confirmed_password: z.string().optional(),
})

const SESSION_VISIBILITY_FORM_SCHEMA = z
  .intersection(UPDATED_SESSION_VISIBILITY_SCHEMA, CONFIRMATION_FIELDS_SCHEMA)
  .refine(
    (data) =>
      data.visibility === 'public' || data.password === data.confirmed_password,
    {
      message: 'Passwords do not match.',
      path: ['confirmed_password'],
    },
  )

export { SESSION_VISIBILITY_FORM_SCHEMA }
export type SessionVisibilityFormSchema = z.infer<
  typeof SESSION_VISIBILITY_FORM_SCHEMA
>
