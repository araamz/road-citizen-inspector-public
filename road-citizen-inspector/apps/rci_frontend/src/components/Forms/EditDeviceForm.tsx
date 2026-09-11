import { UPDATED_DEVICE_SCHEMA } from '@road-citizen-inspector/schemas'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import CheckboxInput from '../Inputs/CheckboxInput'
import TextInput from '../Inputs/TextInput'
import TextAreaInput from '../Inputs/TextAreaInput'
import Button from '../Button'
import type { UpdatedDeviceSchema } from '@road-citizen-inspector/schemas'

export type EditDeviceFormProps = {
  initialValues?: UpdatedDeviceSchema
  formName: string
  onSubmitCallback: (data: UpdatedDeviceSchema) => void
  disabled?: boolean
}
export default function EditDeviceForm({
  initialValues,
  formName,
  onSubmitCallback,
  disabled,
}: EditDeviceFormProps) {
  const { register, handleSubmit, formState } =
    useForm<UpdatedDeviceSchema>({
      defaultValues: initialValues,
      resolver: zodResolver(UPDATED_DEVICE_SCHEMA),
    })

  return (
    <form
      name={formName}
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(onSubmitCallback)}
    >
      <div className="flex flex-col gap-5">
        <TextInput
          {...register('label')}
          label="Device Label"
          description="A friendly name for an device to be easily identified by viewers."
          placeholder="e.g., Plumb Lane/Virginia St. Sensor"
          error={formState.errors.label?.message}
        />
        <TextAreaInput
          {...register('description')}
          label="Device Description"
          description="A brief description of the device to give context of its usage to viewers."
          placeholder="e.g., Traffic sensor located at the intersection of Plumb Lane and Virginia St. for Traffic Project"
          error={formState.errors.description?.message}
        />
        <CheckboxInput
          {...register('is_hidden')}
          label="Hide Device"
          description="If enabled, this device will be hidden from viewers and will not be accounted in data visualizations."
          error={formState.errors.is_hidden?.message}
        />
        <CheckboxInput
          {...register('is_pinned')}
          label="Pin Device"
          description="If enabled, this device will be pinned to viewers for easy access and prominence."
          error={formState.errors.is_pinned?.message}
        />
      </div>
      <div className="flex justify-end pt-5 border-t-1 border-neutral-300">
        <Button disabled={disabled || !formState.isDirty} type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  )
}
