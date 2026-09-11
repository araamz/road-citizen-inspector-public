import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextInput from '../Inputs/TextInput'
import Button from '../Button'
import type {AdministrativePasswordFormSchema} from '@/schemas/AdministrativePasswordForm.schema';
import {
  ADMINISTRATIVE_PASSWORD_FORM_SCHEMA
  
} from '@/schemas/AdministrativePasswordForm.schema'

export type AdministrativePasswordFormProps = {
  initalValues?: AdministrativePasswordFormSchema
  formName: string
  onSumbitCallback: (data: AdministrativePasswordFormSchema) => void
  disabled?: boolean
}
export default function AdministrativePasswordForm({
  initalValues,
  formName,
  onSumbitCallback,
  disabled
}: AdministrativePasswordFormProps) {
  const { register, formState, handleSubmit, reset } =
    useForm<AdministrativePasswordFormSchema>({
      defaultValues: initalValues || {
        administrative_password: '',
        confirmed_administrative_password: ''
      },
      resolver: zodResolver(ADMINISTRATIVE_PASSWORD_FORM_SCHEMA),
    })

  return (
    <form
      name={formName}
      onSubmit={handleSubmit(onSumbitCallback)}
      className="@container/form"
    >
      <div className="flex flex-col gap-5 pb-5 @md/form:grid @md/form:grid-cols-2 @md/form:items-end">
        <TextInput
          type="password"
          description="A memorable password to use as the administrator of this session."
          {...register('administrative_password')}
          error={
            formState.errors.administrative_password?.message ||
            formState.errors.confirmed_administrative_password?.message
          }
          label="Administrative Password"
        />
        <TextInput
          type="password"
          description="Re-enter the administrative password to confirm it matches."
          {...register('confirmed_administrative_password')}
          error={
            formState.errors.confirmed_administrative_password?.message ||
            formState.errors.administrative_password?.message
          }
          label="Confirm Administrative Password"
        />
      </div>
      <div className="flex justify-end pt-5 gap-5 border-t-1 border-neutral-300 flex-wrap">
        <Button disabled={!formState.isDirty || disabled} onClick={() => reset()} variant='secondary'>Undo Changes</Button>
        <Button disabled={!formState.isDirty || disabled}  type="submit">Save Changes</Button>
      </div>
    </form>
  )
}
