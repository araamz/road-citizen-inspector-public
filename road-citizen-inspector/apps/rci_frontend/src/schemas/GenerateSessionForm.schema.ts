import { z } from 'zod'
import { NEW_SESSION_SCHEMA } from '@road-citizen-inspector/schemas'

const CONFIRMATION_FIELDS_SCHEMA = z.object({
  confirmed_administrative_password: z.string(),
  confirmed_password: z.string().optional(),
})

const GENERATE_SESSION_FORM_SCHEMA = z
  .intersection(NEW_SESSION_SCHEMA, CONFIRMATION_FIELDS_SCHEMA)
  .refine(
    (data) =>
      data.visibility === 'public' || data.password === data.confirmed_password,
    {
      message: 'Passwords do not match.',
      path: ['confirmed_password'],
    },
  )
  .refine(
    (data) =>
      data.administrative_password === data.confirmed_administrative_password,
    {
      message: 'Administrative passwords do not match.',
      path: ['confirmed_administrative_password'],
    },
  )

export { GENERATE_SESSION_FORM_SCHEMA }
export type GenerateSessionFormSchema = z.infer<
  typeof GENERATE_SESSION_FORM_SCHEMA
>
