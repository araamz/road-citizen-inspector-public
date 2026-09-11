import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { HiFunnel, HiXMark } from 'react-icons/hi2'
import CheckboxGroupInput from '../Inputs/CheckboxGroupInput/CheckboxGroupInput'
import Skeleton from '../Skeleton'
import CheckboxGroupItem from '../Inputs/CheckboxGroupInput/CheckboxGroupItem'
import RadioInput from '../Inputs/RadioInput/RadioInput'
import RadioItem from '../Inputs/RadioInput/RadioItem'
import TextInput from '../Inputs/TextInput'
import Button from '../Button'
import type { StatusQueryFormSchema } from '@/schemas/StatusQueryForm.schema'
import useProjectDevicesOptions from '@/hooks/queries/device/UseProjectDevicesOptions'

export type StatusQueryFormProps = {
  initalValues?: StatusQueryFormSchema
  formName: string
  onSubmitCallback: (data: StatusQueryFormSchema) => void
  onResetCallback: () => void
  disabled?: boolean
}

export default function StatusQueryForm({
  initalValues,
  formName,
  onSubmitCallback,
  onResetCallback,
  disabled,
}: StatusQueryFormProps) {
  const { data: devices, isPending: devicesPending } = useQuery(
    useProjectDevicesOptions(),
  )


  const { handleSubmit, formState, register, reset } = useForm<StatusQueryFormSchema>({
    defaultValues: {
      device_ids: [],
      sort_order: null,
      device_battery_level_minimum: null,
      device_battery_level_maximum: null,
      device_storage_level_minimum: null,
      device_storage_level_maximum: null,
      status_capture_time_start: null,
      status_capture_time_end: null,
      device_sensor_status: [],
      ...initalValues,
    },
  })

  const handleReset = () => {
    reset()
    onResetCallback()
  }

  return (
    <form
      name={formName}
      onSubmit={handleSubmit(onSubmitCallback)}
      onReset={onResetCallback}
      className="flex flex-col gap-5"
    >
      <div>
        <Skeleton
          isLoading={devicesPending}
          className="w-full bg-neutral-300"
          height="lg"
        >
          <CheckboxGroupInput
            label="Devices"
            description="Choose one or more Traffic Counting Devices (TCDs) to include in your status query."
            error={formState.errors.device_ids?.message}
          >
            {devices
              ? devices
                  .filter((device) => !device.is_hidden)
                  .map((device) => (
                    <CheckboxGroupItem
                      {...register('device_ids')}
                      description={device.label ? device.tts_device_id : undefined}
                      key={device.device_id}
                      value={device.device_id}
                    >
                      {device.label ? device.label : device.tts_device_id}
                    </CheckboxGroupItem>
                  ))
              : undefined}
          </CheckboxGroupInput>
        </Skeleton>
      </div>

      <div>
        <TextInput
          {...register('status_capture_time_start')}
          label="Status Time Start"
          description="Show statuses recorded on or after this date and time."
          type="datetime-local"
          error={formState.errors.status_capture_time_start?.message}
        />
        <TextInput
          {...register('status_capture_time_end')}
          label="Status Time End"
          description="Show statuses recorded on or before this date and time."
          type="datetime-local"
          error={formState.errors.status_capture_time_end?.message}
        />
      </div>

      <div>
        <RadioInput
          label="Sort Order"
          description="Choose how the device statuses should be ordered by capture time."
          error={formState.errors.sort_order?.message}
        >
          <RadioItem
            {...register('sort_order')}
            value="asc"
            label="Ascending"
            description="Display results from earliest to latest."
          />
          <RadioItem
            {...register('sort_order')}
            value="desc"
            label="Descending"
            description="Display results from latest to earliest."
          />
        </RadioInput>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <TextInput
          {...register('device_battery_level_minimum')}
          label="Minimum Battery Level (%)"
          description="Only include devices with at least this battery percentage."
          error={formState.errors.device_battery_level_minimum?.message}
        />
        <TextInput
          {...register('device_battery_level_maximum')}
          label="Maximum Battery Level (%)"
          description="Only include devices with at most this battery percentage."
          error={formState.errors.device_battery_level_maximum?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <TextInput
          {...register('device_storage_level_minimum')}
          label="Minimum Storage Level (%)"
          description="Only include devices with at least this storage usage percentage."
          error={formState.errors.device_storage_level_minimum?.message}
        />
        <TextInput
          {...register('device_storage_level_maximum')}
          label="Maximum Storage Level (%)"
          description="Only include devices with at most this storage usage percentage."
          error={formState.errors.device_storage_level_maximum?.message}
        />
      </div>

      <div>
        <CheckboxGroupInput
          label="Sensor Status"
          description="Filter devices by the health of their onboard sensors."
          error={formState.errors.device_sensor_status?.message}
        >
          <CheckboxGroupItem {...register('device_sensor_status')} value="ok">
            Operational
          </CheckboxGroupItem>
          <CheckboxGroupItem {...register('device_sensor_status')} value="error">
            System Error
          </CheckboxGroupItem>
        </CheckboxGroupInput>
      </div>
      <div className='flex flex-row gap-5 pt-5 border-t border-t-neutral-300 justify-end'>
          <Button disabled={disabled} onClick={() => handleReset()} variant="secondary" startIcon={HiXMark}>
            Reset
          </Button>
          <Button disabled={disabled} type="submit" startIcon={HiFunnel}>
            Query
          </Button>
      </div>
    </form>
  )
}
