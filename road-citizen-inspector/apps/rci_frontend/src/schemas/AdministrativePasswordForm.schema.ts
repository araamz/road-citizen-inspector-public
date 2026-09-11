import { z } from 'zod'
import { UPDATED_SESSION_ADMINISTRATIVE_PASSWORD_SCHEMA } from '@road-citizen-inspector/schemas'

const CONFIRMATION_FIELDS_SCHEMA = z.object({
  confirmed_administrative_password: z.string(),
})

const ADMINISTRATIVE_PASSWORD_FORM_SCHEMA = z
  .intersection(UPDATED_SESSION_ADMINISTRATIVE_PASSWORD_SCHEMA, CONFIRMATION_FIELDS_SCHEMA)
  .refine(
    (data) =>
      data.administrative_password === data.confirmed_administrative_password,
    {
      message: 'Administrative passwords do not match.',
      path: ['confirmed_administrative_password'],
    },
  )

export { ADMINISTRATIVE_PASSWORD_FORM_SCHEMA }
export type AdministrativePasswordFormSchema = z.infer<
  typeof ADMINISTRATIVE_PASSWORD_FORM_SCHEMA
>
