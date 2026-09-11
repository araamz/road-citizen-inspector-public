import { useForm } from 'react-hook-form'
import { HiLockClosed, HiLockOpen } from 'react-icons/hi2'
import { zodResolver } from '@hookform/resolvers/zod'
import RadioInput from '../Inputs/RadioInput/RadioInput'
import RadioItem from '../Inputs/RadioInput/RadioItem'
import TextInput from '../Inputs/TextInput'
import Button from '../Button'
import type { SessionVisibilityFormSchema } from '@/schemas/SessionVisibilityForm.schema'
import { SESSION_VISIBILITY_FORM_SCHEMA } from '@/schemas/SessionVisibilityForm.schema'

export type SessionVisibilityFormProps = {
  initialValues?: Omit<SessionVisibilityFormSchema, 'password' | 'confirmed_password'>
  formName: string
  onSubmitCallback: (data: SessionVisibilityFormSchema) => void
  disabled?: boolean
}
export default function SessionVisibilityForm({
  initialValues,
  formName,
  onSubmitCallback,
  disabled,
}: SessionVisibilityFormProps) {
  const { register, handleSubmit, formState, watch, reset } =
    useForm<SessionVisibilityFormSchema>({
      defaultValues: {
        visibility: initialValues?.visibility || 'public',
        password: '',
        confirmed_password: ''
      },
      shouldUnregister: true,
      resolver: zodResolver(SESSION_VISIBILITY_FORM_SCHEMA),
    })

  const isPrivate = watch('visibility') === 'private'

  return (
    <form
      onSubmit={handleSubmit(onSubmitCallback)}
      name={formName}
      className="flex flex-col gap-5 @container/form"
    >
      <RadioInput
        label="Session Visibility"
        error={formState.errors.visibility?.message}
        description="Select an access control setting to limit or allow others to view your session data."
      >
        <RadioItem
          {...register('visibility')}
          value="public"
          label="Public"
          icon={HiLockOpen}
          description="Allow the session to accessible without an password restriction."
        />
        <RadioItem
          {...register('visibility')}
          value="private"
          label="Private"
          icon={HiLockClosed}
          description="Make the session require a password for access."
        />
      </RadioInput>
      {isPrivate ? (
        <div className="flex flex-col gap-5 @md/form:grid @md/form:grid-cols-2 @md/form:items-end">
          <TextInput
            type="password"
            {...register('password')}
            error={
              formState.errors.password?.message ||
              formState.errors.confirmed_password?.message
            }
            label="Session Password"
            description="A memorable and secure password for others to use. The password allows others to access the private session."
          />
          <TextInput
            type="password"
            {...register('confirmed_password')}
            error={
              formState.errors.confirmed_password?.message ||
              formState.errors.password?.message
            }
            label="Confirm Session Password"
            description="Re-enter the session password to confirm it matches."
          />
        </div>
      ) : undefined}
      <div className="flex pt-5 gap-5 border-t-1 justify-end border-neutral-300 flex-wrap">
        <Button
          disabled={!formState.isDirty || disabled}
          onClick={() => reset()}
          variant="secondary"
        >
          Undo Changes
        </Button>
        <Button disabled={!formState.isDirty || disabled} type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  )
}
