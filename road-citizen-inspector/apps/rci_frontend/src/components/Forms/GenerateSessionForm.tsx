import { HiLockClosed, HiLockOpen, HiPlus } from 'react-icons/hi2'
import {  useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../Button'
import type {FieldErrors} from 'react-hook-form';
import type {GenerateSessionFormSchema} from '@/schemas/GenerateSessionForm.schema';
import TextInput from '@/components/Inputs/TextInput'
import TextAreaInput from '@/components/Inputs/TextAreaInput'
import RadioInput from '@/components/Inputs/RadioInput/RadioInput'
import RadioItem from '@/components/Inputs/RadioInput/RadioItem'

import {
  GENERATE_SESSION_FORM_SCHEMA
  
} from '@/schemas/GenerateSessionForm.schema'

// TODO: Make user friendly error messages.
export type GenerateSessionFormProps = {
  formName: string
  onSumbitCallback: (data: GenerateSessionFormSchema) => void
}

export default function GenerateSessionForm({
  formName,
  onSumbitCallback,
}: GenerateSessionFormProps) {
  const { register, watch, handleSubmit, formState } =
    useForm<GenerateSessionFormSchema>({
      resolver: zodResolver(GENERATE_SESSION_FORM_SCHEMA),
      shouldUnregister: true,
    })

  const isPrivate = watch('visibility') === 'private'

  const renderTitleError = (
    error: FieldErrors<GenerateSessionFormSchema>['title'],
  ) => {
    if (error?.type === 'too_small')
      return 'The title is too short. Session title must be at least 10 character(s).'
  }

  return (
    <form
      onSubmit={handleSubmit(onSumbitCallback)}
      name={formName}
      className="flex flex-col gap-5 @container/form"
    >
      <TextInput
        placeholder="e.g., Virginia St. Monitoring"
        description="A short, descriptive title for your traffic monitoring session."
        {...register('title')}
        error={renderTitleError(formState.errors.title)}
        label="Session Title"
      />
      <TextAreaInput
        rows={3}
        placeholder="e.g., Monitoring traffic flows for a temporary study on the effects of recent construction."
        description="A description for your session for others when viewing the session."
        {...register('description')}
        error={formState.errors.description?.message}
        label="Session Description"
      />
      <div className="flex flex-col gap-5 @md/form:grid @md/form:grid-cols-2 @md/form:items-end">
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
      <div className='flex justify-end pt-5 border-t-1 border-neutral-300 flex-wrap'>
        <Button type="submit" startIcon={HiPlus}>
          Generate Session
        </Button>
      </div>
    </form>
  )
}
