import type { RecentSessionSettingsFormSchema } from '@/schemas/RecentSessionSettingsForm.schema'
import RecentSessionSettingsForm from './Forms/RecentSessionSettingsForm'

export type RecentSessionSettingsProps = {
  onSubmit: (data: RecentSessionSettingsFormSchema) => void
  currentSettings: RecentSessionSettingsFormSchema
  formName?: string
}
export default function RecentSessionSettings({
  onSubmit,
  currentSettings,
  formName = 'recent-session-settings-form',
}: RecentSessionSettingsProps) {
  return (
    <div>
      <RecentSessionSettingsForm  initialValues={currentSettings} onSubmitCallback={(data) => onSubmit(data)} formName={formName} />
    </div>
  )
}
