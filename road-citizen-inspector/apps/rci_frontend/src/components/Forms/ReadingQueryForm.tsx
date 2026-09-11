import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { HiFunnel, HiXMark } from 'react-icons/hi2'
import CheckboxGroupInput from '../Inputs/CheckboxGroupInput/CheckboxGroupInput'
import CheckboxGroupItem from '../Inputs/CheckboxGroupInput/CheckboxGroupItem'
import TextInput from '../Inputs/TextInput'
import RadioInput from '../Inputs/RadioInput/RadioInput'
import RadioItem from '../Inputs/RadioInput/RadioItem'
import Button from '../Button'
import Skeleton from '../Skeleton'
import type { ReadingQueryFormSchema } from '@/schemas/ReadingQueryForm.schema'
import { READING_QUERY_FORM_SCHEMA } from '@/schemas/ReadingQueryForm.schema'
import useProjectDevicesOptions from '@/hooks/queries/device/UseProjectDevicesOptions'

export type ReadingQueryFormProps = {
  initalValues?: ReadingQueryFormSchema
  formName: string
  onSubmitCallback: (data: ReadingQueryFormSchema) => void
  onResetCallback: () => void
  disabled?: boolean
}

export default function ReadingQueryForm({
  initalValues,
  formName,
  onSubmitCallback,
  onResetCallback,
  disabled,
}: ReadingQueryFormProps) {
  const { handleSubmit, register, formState, reset } =
    useForm<ReadingQueryFormSchema>({
      resolver: zodResolver(READING_QUERY_FORM_SCHEMA),
      defaultValues: {
        ...initalValues,
        vehicle_detection_time_start:
          initalValues?.vehicle_detection_time_start ?? null,
        vehicle_detection_time_end:
          initalValues?.vehicle_detection_time_end ?? null,
        sort_order: initalValues?.sort_order || null,
        vehicle_speed_maximum: initalValues?.vehicle_speed_maximum ?? null,
        vehicle_speed_minimum: initalValues?.vehicle_speed_minimum ?? null,
        device_ids: initalValues?.device_ids ?? [],
        vehicle_types: initalValues?.vehicle_types ?? [],
        vehicle_lanes: initalValues?.vehicle_lanes ?? [],
        vehicle_directions: initalValues?.vehicle_directions ?? [],
        road_primary_directions: initalValues?.road_primary_directions ?? [],
        road_types: initalValues?.road_types ?? [],
        road_secondary_directions:
          initalValues?.road_secondary_directions ?? [],
      },
    })

  const { data: devices, isPending: devicesPending } = useQuery(
    useProjectDevicesOptions(),
  )

  const handleReset = () => {
    reset()
    onResetCallback()
  }

  return (
    <form
      className="flex flex-col gap-5 p-1"
      onSubmit={handleSubmit((data) => onSubmitCallback(data))}
      name={formName}
    >
      <div>
        <Skeleton
          isLoading={devicesPending}
          className="w-full bg-neutral-300"
          height="lg"
        >
          <CheckboxGroupInput
            label="Devices"
            description="Select one or more Traffic Counting Devices (TCDs) to include in this query."
            error={formState.errors.device_ids?.message}
          >
            {devices ? devices.filter((device) => !device.is_hidden).map((device) => (
                <CheckboxGroupItem
                  {...register('device_ids')}
                  description={device.label ? device.tts_device_id : undefined}
                  key={device.device_id}
                  value={device.device_id}
                  disabled={disabled}
                >
                  {device.label ? device.label : device.tts_device_id}
                </CheckboxGroupItem>
              )): undefined}
          </CheckboxGroupInput>
        </Skeleton>
      </div>

      <div>
        <RadioInput
          label="Sort Order"
          description="Choose the order in which readings should be sorted by vehicle detection time."
          error={formState.errors.sort_order?.message}
        >
          <RadioItem
            {...register('sort_order')}
            value="asc"
            label="Ascending"
            description="Sort results from the earliest to the latest vehicle detections."
          />
          <RadioItem
            {...register('sort_order')}
            value="desc"
            label="Descending"
            description="Sort results from the latest to the earliest vehicle detections."
          />
        </RadioInput>
      </div>

      <div className="flex flex-col gap-2.5">
        <TextInput
          error={formState.errors.vehicle_detection_time_start?.message}
          description="Only include readings detected on or after this date and time."
          type="datetime-local"
          label="Earliest Vehicle Detection Time"
          {...register('vehicle_detection_time_start')}
        />
        <TextInput
          error={formState.errors.vehicle_detection_time_end?.message}
          description="Only include readings detected on or before this date and time."
          type="datetime-local"
          label="Latest Vehicle Detection Time"
          {...register('vehicle_detection_time_end')}
        />
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <TextInput
              type="number"
              error={formState.errors.vehicle_speed_minimum?.message}
              description="Only include readings where the detected vehicle traveled at or above this speed (mph)."
              label="Vehicle Speed Minimum"
              {...register('vehicle_speed_minimum')}
            />
            <TextInput
              error={formState.errors.vehicle_speed_maximum?.message}
              description="Only include readings where the detected vehicle traveled at or below this speed (mph)."
              label="Vehicle Speed Maximum"
              {...register('vehicle_speed_maximum')}
            />
          </div>
        </div>
      </div>

      <div>
        <CheckboxGroupInput
          label="Road Type"
          description="Specify the road configuration used by the TCD."
          error={formState.errors.road_types?.message}
        >
          <CheckboxGroupItem
            description="Single direction, double lanes."
            value="sddl"
            {...register('road_types')}
          >
            SDDL
          </CheckboxGroupItem>
          <CheckboxGroupItem
            description="Single direction, single lane."
            value="sdsl"
            {...register('road_types')}
          >
            SDSL
          </CheckboxGroupItem>
          <CheckboxGroupItem
            description="Double directions, double lanes."
            value="dddl"
            {...register('road_types')}
          >
            DDDL
          </CheckboxGroupItem>
          <CheckboxGroupItem
            description="Double directions, single lane."
            value="ddsl"
            {...register('road_types')}
          >
            DDSL
          </CheckboxGroupItem>
        </CheckboxGroupInput>
      </div>

      <div className="flex flex-col gap-2.5">
        <CheckboxGroupInput
          label="Road Primary Direction"
          description="Select the primary direction of travel corresponding to the front-facing orientation of the TCD."
          error={formState.errors.road_primary_directions?.message}
        >
          <CheckboxGroupItem
            {...register('road_primary_directions')}
            value="north"
          >
            North (N)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_primary_directions')}
            value="northeast"
          >
            Northeast (NE)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_primary_directions')}
            value="east"
          >
            East (E)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_primary_directions')}
            value="southeast"
          >
            Southeast (SE)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_primary_directions')}
            value="south"
          >
            South (S)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_primary_directions')}
            value="southwest"
          >
            Southwest (SW)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_primary_directions')}
            value="west"
          >
            West (W)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_primary_directions')}
            value="northwest"
          >
            Northwest (NW)
          </CheckboxGroupItem>
        </CheckboxGroupInput>

        <CheckboxGroupInput
          label="Road Secondary Direction"
          description="Select the opposite or secondary direction of travel that the roadway supports."
          error={formState.errors.road_secondary_directions?.message}
        >
          <CheckboxGroupItem
            {...register('road_secondary_directions')}
            value="north"
          >
            North (N)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_secondary_directions')}
            value="northeast"
          >
            Northeast (NE)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_secondary_directions')}
            value="east"
          >
            East (E)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_secondary_directions')}
            value="southeast"
          >
            Southeast (SE)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_secondary_directions')}
            value="south"
          >
            South (S)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_secondary_directions')}
            value="southwest"
          >
            Southwest (SW)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_secondary_directions')}
            value="west"
          >
            West (W)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('road_secondary_directions')}
            value="northwest"
          >
            Northwest (NW)
          </CheckboxGroupItem>
        </CheckboxGroupInput>
      </div>

      <div className="flex flex-col gap-2.5">
        <CheckboxGroupInput
          label="Vehicle Type"
          description="Filter readings by the type of vehicle detected by the system."
          error={formState.errors.vehicle_types?.message}
        >
          <CheckboxGroupItem {...register('vehicle_types')} value="car">
            Car
          </CheckboxGroupItem>
          <CheckboxGroupItem {...register('vehicle_types')} value="truck">
            Truck
          </CheckboxGroupItem>
          <CheckboxGroupItem {...register('vehicle_types')} value="motorcycle">
            Motorcycle
          </CheckboxGroupItem>
          <CheckboxGroupItem {...register('vehicle_types')} value="unknown">
            Unknown
          </CheckboxGroupItem>
        </CheckboxGroupInput>

        <CheckboxGroupInput
          label="Vehicle Lane"
          description="Select the roadway lane(s) to include in the query, based on how your TCD is configured."
          error={formState.errors.vehicle_lanes?.message}
        >
          <CheckboxGroupItem {...register('vehicle_lanes')} value="1">
            Lane 1
          </CheckboxGroupItem>
          <CheckboxGroupItem {...register('vehicle_lanes')} value="2">
            Lane 2
          </CheckboxGroupItem>
          <CheckboxGroupItem {...register('vehicle_lanes')} value="3">
            Lane 3
          </CheckboxGroupItem>
          <CheckboxGroupItem {...register('vehicle_lanes')} value="4">
            Lane 4
          </CheckboxGroupItem>
        </CheckboxGroupInput>

        <CheckboxGroupInput
          label="Vehicle Direction"
          description="Filter readings by the direction of vehicle travel relative to the TCD's orientation."
          error={formState.errors.vehicle_directions?.message}
        >
          <CheckboxGroupItem {...register('vehicle_directions')} value="north">
            North (N)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('vehicle_directions')}
            value="northeast"
          >
            Northeast (NE)
          </CheckboxGroupItem>
          <CheckboxGroupItem {...register('vehicle_directions')} value="east">
            East (E)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('vehicle_directions')}
            value="southeast"
          >
            Southeast (SE)
          </CheckboxGroupItem>
          <CheckboxGroupItem {...register('vehicle_directions')} value="south">
            South (S)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('vehicle_directions')}
            value="southwest"
          >
            Southwest (SW)
          </CheckboxGroupItem>
          <CheckboxGroupItem {...register('vehicle_directions')} value="west">
            West (W)
          </CheckboxGroupItem>
          <CheckboxGroupItem
            {...register('vehicle_directions')}
            value="northwest"
          >
            Northwest (NW)
          </CheckboxGroupItem>
          <CheckboxGroupItem {...register('vehicle_directions')} value="unknown">
            Unknown
          </CheckboxGroupItem>
        </CheckboxGroupInput>
      </div>

      <div className="flex justify-end pt-5 border-t-neutral-300 border-t flex-row gap-5">
        <Button
          disabled={disabled}
          startIcon={HiXMark}
          onClick={() => handleReset()}
          variant='secondary'
        >
          Reset
        </Button>
        <Button disabled={disabled} startIcon={HiFunnel}>
          Query
        </Button>
      </div>
    </form>
  )
}
