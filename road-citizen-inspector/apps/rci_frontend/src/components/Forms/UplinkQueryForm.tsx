import { HiFunnel, HiXMark } from 'react-icons/hi2'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../Button'
import CheckboxGroupInput from '../Inputs/CheckboxGroupInput/CheckboxGroupInput'
import CheckboxGroupItem from '../Inputs/CheckboxGroupInput/CheckboxGroupItem'
import RadioInput from '../Inputs/RadioInput/RadioInput'
import RadioItem from '../Inputs/RadioInput/RadioItem'
import TextInput from '../Inputs/TextInput'
import Note from '../Note'
import type { DeviceData } from '@road-citizen-inspector/contracts'
import type {UplinkQueryFormSchema} from '@/schemas/UplinkQueryForm.schema';
import { UPLINK_QUERY_FORM_SCHEMA  } from '@/schemas/UplinkQueryForm.schema'

export type UplinkQueryFormProps = {
  initialValues?: UplinkQueryFormSchema
  formName: string
  onResetCallback: () => void,
  onSubmitCallback: (data: UplinkQueryFormSchema) => void
  disabled?: boolean
  devices: Array<DeviceData>
}
export default function UplinkQueryForm({
  initialValues,
  formName,
  onResetCallback,
  onSubmitCallback,
  disabled,
}: UplinkQueryFormProps) {

  const { handleSubmit, register, formState, reset } = useForm<UplinkQueryFormSchema>({
    defaultValues: {
      created_at_start: null,
      created_at_end: null,
      updated_at_start: null,
      updated_at_end: null,
      sort_order: null,
      processed: null,
      unprocessed: null,
      failed: null,
      page: null,
      size: null,
      ...initialValues,
    },
    resolver: zodResolver(UPLINK_QUERY_FORM_SCHEMA),
  })


  const handleProcessedSubmit = (data: UplinkQueryFormSchema) => {
    onSubmitCallback({
      ...data,
    })
  }

  const handleReset = () => {
    reset()
    onResetCallback()
  }

  return (
    <form
      className="flex flex-col gap-5 p-1"
      onSubmit={handleSubmit(handleProcessedSubmit)}
      name={formName}
    >
      <div className="flex flex-col gap-2.5">
        <TextInput
          {...register('created_at_start')}
          type="datetime-local"
          label="Created Start Date"
          description="Show uplinks created on or after this timestamp."
          error={formState.errors.created_at_start?.message}
        />
        <TextInput
          {...register('created_at_end')}
          type="datetime-local"
          label="Created End Date"
          description="Show uplinks created on or before this timestamp."
          error={formState.errors.created_at_end?.message}
        />
      </div>
      <div className="flex flex-col gap-2.5">
        <TextInput
          {...register('updated_at_start')}
          type="datetime-local"
          label="Updated Start Date"
          description="Filter uplinks based on when they were last updated."
          error={formState.errors.updated_at_start?.message}
        />
        <TextInput
          {...register('updated_at_end')}
          type="datetime-local"
          label="Updated End Date"
          description="Filter uplinks up to a specific last updated timestamp."
          error={formState.errors.updated_at_end?.message}
        />
      </div>
      <RadioInput
        label="Sort Order"
        description="Choose whether you want the earliest or latest uplinks to appear first."
        error={formState.errors.sort_order?.message}
      >
        <RadioItem
          {...register('sort_order')}
          value="asc"
          label="Ascending"
          description="Sort results from oldest to newest."
        />
        <RadioItem
          {...register('sort_order')}
          value="desc"
          label="Descending"
          description="Sort results from newest to oldest."
        />
      </RadioInput>
      <div className="flex flex-col gap-2.5">
        <Note type="general">
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              Uplinks aren't processed immediately. Each one moves through one
              of the following three states:
            </p>

            <div className="text-sm flex flex-col gap-1.5">
              <p>
                <span className="font-semibold">Unprocessed:</span> The uplink
                has been received from The Things Stack and is waiting to be
                classified as either a status or reading message.
              </p>

              <p>
                <span className="font-semibold">Processed:</span> The uplink was
                successfully processed and categorized.
              </p>

              <p>
                <span className="font-semibold">Failed:</span> The uplink was
                processed but could not be converted into a valid status or
                reading message.
              </p>
            </div>
          </div>
        </Note>
        <CheckboxGroupInput
          label="Status Type"
          description="Select whether you want to see unprocessed, processed, or failed uplinks."
          error={
            formState.errors.failed?.message ||
            formState.errors.processed?.message ||
            formState.errors.unprocessed?.message
          }
        >
          <CheckboxGroupItem {...register('unprocessed')}>Unprocessed</CheckboxGroupItem>
          <CheckboxGroupItem {...register('processed')} >Processed</CheckboxGroupItem>
          <CheckboxGroupItem {...register('failed')} >Failed</CheckboxGroupItem>
        </CheckboxGroupInput>
      </div>
      <div className="flex justify-end pt-5 border-t-neutral-300 border-t gap-5">
        <Button disabled={disabled} startIcon={HiXMark} onClick={() => handleReset()} variant='secondary'>
          Reset
        </Button>
        <Button disabled={disabled} startIcon={HiFunnel}>
          Query
        </Button>
      </div>
    </form>
  )
}
