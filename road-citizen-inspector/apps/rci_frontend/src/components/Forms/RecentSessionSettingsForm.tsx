import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import TextInput from '../Inputs/TextInput'
import CheckboxInput from '../Inputs/CheckboxInput'
import Button from '../Button'
import type {RecentSessionSettingsFormSchema} from '@/schemas/RecentSessionSettingsForm.schema';
import {
  RECENT_SESSION_SETTINGS_FORM
  
} from '@/schemas/RecentSessionSettingsForm.schema'

export type RecentSessionSettingsFormProps = {
  initialValues: RecentSessionSettingsFormSchema
  formName: string
  onSubmitCallback: (data: RecentSessionSettingsFormSchema) => void
}
export default function RecentSessionSettingsForm({
  initialValues,
  formName,
  onSubmitCallback,
}: RecentSessionSettingsFormProps) {
  const { register, handleSubmit, formState } =
    useForm<RecentSessionSettingsFormSchema>({
      resolver: zodResolver(RECENT_SESSION_SETTINGS_FORM),
      defaultValues: initialValues,
    })

  return (
    <form
      name={formName}
      onSubmit={handleSubmit(onSubmitCallback)}
      className="flex flex-col gap-5"
    >
      <TextInput
        {...register('personalized_name')}
        description="Memorable name to refer to your session bookmark. Editing this will only modify the bookmark and not the session."
        placeholder="e.g., Downtown Traffic Project"
        label="Personalized Name"
        error={formState.errors.personalized_name?.message}
      />
      <CheckboxInput
        label="Session Favorited"
        description="Favorited sessions are posted to the top of your bookmarks for quick access."
        error={formState.errors.is_favorite?.message}
        {...register('is_favorite')}
      />
      <div className='flex justify-end pt-5 border-t-1 border-neutral-300 flex-wrap'>
        <Button type='submit'>Save Changes</Button>
      </div>
    </form>
  )
}
