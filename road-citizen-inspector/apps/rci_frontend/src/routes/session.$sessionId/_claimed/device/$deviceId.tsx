import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from "zod"
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import _ from 'lodash'
import toast from 'react-hot-toast'
import { HiMiniPencil } from 'react-icons/hi2'
import type { VisualizationInterval } from '@/components/Inputs/VisualizationInputs/VisualizationIntervalSelect'
import type { AdvancedDeviceFiltersFormSchema } from '@/schemas/AdvancedDeviceFiltersForm.schema'
import type { DeviceAbstractQuerySchema } from '@road-citizen-inspector/schemas'
import DeviceDashboard from '@/components/ContentDashboards/DeviceDashboard'
import FloatUpWrapper from '@/components/Motion/FloatUpWrapper'
import ViewShell from '@/components/ViewShell'
import { DIRECTIONS, LANES_STR, STATUS_VALUES, VEHICLE_TYPES } from '@/constants'
import useDeviceConfigurationOptions from '@/hooks/queries/device/UseDeviceConfigurationOptions'
import AdvancedDeviceFilters from '@/components/AdvancedDeviceFilters'
import DeviceTimeQuery from '@/components/DeviceTimeQuery'
import UseDeviceVisualizationSuspenseOptions from '@/hooks/queries/visualization/UseDeviceVisualizationOptions.suspense'
import Badge from '@/components/Badge'
import DeviceVitalsGroup from '@/components/DeviceVitalsGroup/DeviceVItalsGroup'
import useDeviceConfigurationSuspenseOptions from '@/hooks/queries/device/UseDeviceConfigurationOptions.suspense'
import UseDeviceVisualizationOptions from '@/hooks/queries/visualization/UseDeviceVisualizationOptions'
import LoadingPing from '@/components/LoadingPing'
import ErrorComponent from '@/components/Suspense/ErrorComponent.suspense'
import Button from '@/components/Button'

const DEFAULT_TIME_WINDOW_HRS = 6;

const TIME_INTERVALS: Array<VisualizationInterval> = [
  {
    value: '60',
    label: '60 min',
    interval: 60
  },
  {
    value: '30',
    label: '30 min',
    interval: 30
  },
  {
    value: '15',
    label: '15 min',
    interval: 15
  },
  {
    value: '5',
    label: '5 min',
    interval: 5
  }
] as const

const TIME_INTERVALS_MINS = TIME_INTERVALS.map((interval) => interval.value) as [
  (typeof TIME_INTERVALS)[number]["value"],
  ...Array<(typeof TIME_INTERVALS)[number]["value"]>
];
const DEFAULT_TIME_INTERVAL: typeof TIME_INTERVALS[number]['value'] = "60"

const COMPUTE_END_DATETIME = () => {
  const initalTime = new Date(Date.now())
  initalTime.setMinutes(0, 0, 0)
  return initalTime;
}

const COMPUTE_START_DATETIME = () => {
  const initalTime = new Date(Date.now())
  initalTime.setMinutes(0, 0, 0)

  return new Date(initalTime.getTime() - DEFAULT_TIME_WINDOW_HRS * 60 * 60 * 1000)
}

const DEVICE_SEARCH_PARAMS_SCHEMA = z.object({
  start: fallback(z.string().datetime(), COMPUTE_START_DATETIME().toISOString()).default(COMPUTE_START_DATETIME().toISOString()),
  end: fallback(z.string().datetime(), COMPUTE_END_DATETIME().toISOString()).default(COMPUTE_END_DATETIME().toISOString()),
  interval: fallback(z.enum(TIME_INTERVALS_MINS), DEFAULT_TIME_INTERVAL).default(DEFAULT_TIME_INTERVAL),
  direction: z.array(z.enum([...DIRECTIONS])).optional(),
  type: z.array(z.enum([...VEHICLE_TYPES])).optional(),
  lane: z.array(z.enum([...LANES_STR])).optional(),
  minSpeed: z.coerce.number().optional(),
  maxSpeed: z.coerce.number().optional(),
  minBattery: fallback(z.coerce.number().min(0).max(100).optional(), undefined),
  maxBattery: fallback(z.coerce.number().min(0).max(100).optional(), undefined),
  minStorage: fallback(z.coerce.number().min(0).max(100).optional(), undefined),
  maxStorage: fallback(z.coerce.number().min(0).max(100).optional(), undefined),
  status: z.array(z.enum([...STATUS_VALUES])).optional()
})
export type DeviceSearchParamsSchema = z.infer<typeof DEVICE_SEARCH_PARAMS_SCHEMA>
type DeviceTimeQuerySearchValues = Pick<DeviceSearchParamsSchema,
  | "start"
  | "end"
  | "interval"
>
type AdvancedDeviceFilterSearchValues = Omit<DeviceSearchParamsSchema,
  | "start"
  | "end"
  | "interval"
>

const TRANSFORM_SEARCH_PARAMS = (search: DeviceSearchParamsSchema): DeviceAbstractQuerySchema => {

  const processedInterval = TIME_INTERVALS.find((interval) => interval.value === search.interval)
  const processedLanes = search.lane ? search.lane.map((l) => Number(l)) : undefined

  if (!processedInterval) throw new Error("Error occurred when processing interval.")

  return {
    visualizationStart: new Date(search.start),
    visualizationEnd: new Date(search.end),
    intervalDurationMinutes: Number(search.interval),
    vehicle_directions: search.direction ?? null,
    vehicle_lanes: processedLanes ?? null,
    vehicle_types: search.type ?? null,
    vehicle_speed_minimum: search.minSpeed ?? null,
    vehicle_speed_maximum: search.maxSpeed ?? null,
    device_battery_level_minimum: search.minBattery ?? null,
    device_battery_level_maximum: search.maxBattery ?? null,
    device_storage_level_minimum: search.minStorage ?? null,
    device_storage_level_maximum: search.maxStorage ?? null,
    device_sensor_status: search.status ?? null,
    includeData: false
  }
}

export const Route = createFileRoute(
  '/session/$sessionId/_claimed/device/$deviceId',
)({
  component: RouteComponent,
  validateSearch: zodValidator(DEVICE_SEARCH_PARAMS_SCHEMA),
  beforeLoad: async ({ search, context, params }) => {

    const { queryClient } = context;
    const { deviceId } = params;

    const dAbstractQuery = TRANSFORM_SEARCH_PARAMS(search)
    const deviceVisualizationRequest = queryClient.ensureQueryData(
      UseDeviceVisualizationSuspenseOptions(
        Number(deviceId),
        dAbstractQuery
      ),
    )
    const deviceConfigurationRequest = queryClient.ensureQueryData(
      useDeviceConfigurationOptions(Number(deviceId))
    )

    await Promise.all([deviceConfigurationRequest, deviceVisualizationRequest])
  }
})

function RouteComponent() {

  const { deviceId } = Route.useParams()
  const searchParams = Route.useSearch()
  const navigate = useNavigate({
    from: Route.fullPath
  })
  const [drawerState, setDrawerState] = useState<{
    advancedDeviceFilters: boolean;
    deviceTimeQuery: boolean;
  }>({
    advancedDeviceFilters: false,
    deviceTimeQuery: false
  })

  const {
    data: deviceVisualization,
    isPending: deviceVisualizationPending,
    error: deviceVisualizationError
  } = useQuery(
    UseDeviceVisualizationOptions(Number(deviceId),
      TRANSFORM_SEARCH_PARAMS(searchParams)
    )
  )
  const { data: deviceConfiguration, isPending: deviceConfigurationPending, error: deviceConfigurationError } = useSuspenseQuery(
    useDeviceConfigurationSuspenseOptions(Number(deviceId))
  )

  const handleDrawerState = (
    key: "advancedDeviceFilters" | "deviceTimeQuery",
    value: boolean
  ) => {
    setDrawerState((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const advancedDeviceFilterValues = useMemo((): AdvancedDeviceFiltersFormSchema => ({
    vehicle_direction: searchParams.direction,
    vehicle_lane: searchParams.lane,
    vehicle_type: searchParams.type,
    vehicle_speed_mininum: searchParams.minSpeed,
    vehicle_speed_maximum: searchParams.maxSpeed,
    device_battery_mininum: searchParams.minBattery,
    device_battery_maximum: searchParams.maxBattery,
    device_storage_mininum: searchParams.minStorage,
    device_storage_maximum: searchParams.maxStorage,
    device_status: searchParams.status
  })
    , [searchParams])

  const [timeQueryState, setTimeQueryState] = useState<DeviceTimeQuerySearchValues>({
    start: searchParams['start'],
    end: searchParams['end'],
    interval: searchParams['interval']
  })

  function handleTimeQueryChange<TKey extends keyof DeviceTimeQuerySearchValues>(
    key: TKey,
    value: DeviceTimeQuerySearchValues[TKey]
  ) {
    setTimeQueryState((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleIntervalSelection = (interval: VisualizationInterval) => {
    handleTimeQueryChange('interval', interval.value)
  }

  const selectedInterval = useMemo(() => {
    return TIME_INTERVALS.find((timeInterval) => timeInterval.value === timeQueryState.interval)
  }, [timeQueryState])

  const handleAdvancedDeviceFilterSubmission = (data: AdvancedDeviceFiltersFormSchema) => {

    const searchQuery: AdvancedDeviceFilterSearchValues = {
      type: data.vehicle_type && data.vehicle_type.length === 0 ? undefined : data.vehicle_type,
      lane: data.vehicle_lane && data.vehicle_lane.length === 0 ? undefined : data.vehicle_lane,
      direction: data.vehicle_direction && data.vehicle_direction.length === 0 ? undefined : data.vehicle_direction,
      minSpeed: data.vehicle_speed_mininum,
      maxSpeed: data.vehicle_speed_maximum,
      minBattery: data.device_battery_mininum,
      maxBattery: data.device_battery_maximum,
      minStorage: data.device_storage_mininum,
      maxStorage: data.device_storage_maximum,
      status: data.device_status && data.device_status.length === 0 ? undefined : data.device_status,
    }

    navigate({
      search: (prev) => ({
        ...prev,
        ...searchQuery
      })
    }).then(() => handleDrawerState('advancedDeviceFilters', false))

  }

  const handleRemoveFilters = () => {
    const searchQuery: AdvancedDeviceFilterSearchValues = {
      type: undefined,
      lane: undefined,
      direction: undefined,
      minSpeed: undefined,
      maxSpeed: undefined,
      minBattery: undefined,
      maxBattery: undefined,
      minStorage: undefined,
      maxStorage: undefined,
      status: undefined,
    }

    navigate({
      search: (prev) => ({
        ...prev,
        ...searchQuery
      })
    }).then(() => handleDrawerState("advancedDeviceFilters", false))
  }

  const handleTimeQuerySubmission = async () => {

    const startDateTime = new Date(timeQueryState.start).getTime()
    const endDateTime = new Date(timeQueryState.end).getTime()

    if (isNaN(startDateTime) || isNaN(endDateTime)) {
      toast.error("Invalid timestamps. Please enter valid start and end times.");
      return;
    }

    if (startDateTime > endDateTime) {
      toast.error("Invalid timestamps. Start time must be earlier than the end time.");
      return;
    }


    await navigate({
      search: (prev) => ({
        ...prev,
        interval: timeQueryState.interval,
        start: new Date(timeQueryState.start).toISOString(),
        end: new Date(timeQueryState.end).toISOString()
      })
    })
  }

  const handleTimeQueryReset = () => {
    setTimeQueryState((prev) => ({
      ...prev,
      interval: searchParams.interval,
      start: searchParams.start,
      end: searchParams.end
    }))
  }

  // Helper Functions
  const formatLocalISOTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60_000;
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const isTimeQueryStale = useMemo(() => {

    const normalizedSearchParams = {
      interval: searchParams.interval,
      start: new Date(searchParams.start).getTime(),
      end: new Date(searchParams.end).getTime()
    }

    const normalizedTimeQuery = {
      interval: timeQueryState.interval,
      start: new Date(timeQueryState.start).getTime(),
      end: new Date(timeQueryState.end).getTime()
    }

    return _.isEqual(normalizedSearchParams, normalizedTimeQuery)
  }, [searchParams, timeQueryState])

  return (
    <ViewShell type='power'>
      <FloatUpWrapper>
        <div className='w-full min-h-full p-5 flex flex-col gap-5'>
          <div className='flex justify-between items-end'>
            <div>
              <AdvancedDeviceFilters
                drawerProps={{
                  open: drawerState.advancedDeviceFilters,
                  onOpenChange: (open) => handleDrawerState('advancedDeviceFilters', open)
                }}
                queryCallback={{
                  handler: (data) => handleAdvancedDeviceFilterSubmission(data)
                }}
                removeFiltersCallback={{
                  handler: () => handleRemoveFilters()
                }}
                deviceConfiguration={deviceConfiguration.configuration}
                disabled={deviceConfigurationError !== null || deviceConfigurationPending}
                initalValues={advancedDeviceFilterValues}
              />
            </div>
            <div>
              <DeviceTimeQuery
                drawerProps={{
                  open: drawerState.deviceTimeQuery,
                  onOpenChange: (open) => handleDrawerState("deviceTimeQuery", open)
                }}
                intervalProps={{
                  intervals: TIME_INTERVALS,
                  intervalValue: selectedInterval || TIME_INTERVALS[0],
                  setInterval: (interval) => handleIntervalSelection(interval)
                }}
                startTimestampProps={{
                  label: "Start Timestamp",
                  description: "Set the starting timestamp for the visualization.",
                  timestampValue: searchParams.start === timeQueryState.start ? formatLocalISOTimestamp(searchParams.start) : timeQueryState.start,
                  setTimestamp: (t) => handleTimeQueryChange('start', t)
                }}
                endTimestampProps={{
                  label: "End Timestamp",
                  description: "Set the ending timestamp for the visualization.",
                  timestampValue: searchParams.end === timeQueryState.end ? formatLocalISOTimestamp(searchParams.end) : timeQueryState.end,
                  setTimestamp: (t) => handleTimeQueryChange('end', t)
                }}
                query={{
                  handler: () => handleTimeQuerySubmission(),
                  disabled: isTimeQueryStale
                }}
                reset={{
                  handler: () => handleTimeQueryReset(),
                  disabled: isTimeQueryStale
                }}
              />
            </div>
          </div>
          <div className='w-full @container'>
            <div className='flex flex-col gap-x-5 gap-y-2.5 items-center @lg:justify-between @lg:flex-row'>
              <div className='flex flex-col items-center gap-2.5 w-fit @lg:items-start @xl:flex-row @xl:items-center'>
                {deviceConfiguration.device.is_pinned && (
                  <Badge icon={HiMiniPencil} label='PINNED' className='text-black/75 bg-amber-400 text-medium' />
                )}
                <p className='font-lg font-medium text-black leading-none line-clamp-1'>
                  {deviceConfiguration.device.label
                    ? `${deviceConfiguration.device.label} (${deviceConfiguration.device.tts_device_id})`
                    : deviceConfiguration.device.tts_device_id}
                </p>
              </div>
              <div className='flex gap-2.5 flex-wrap @md:justify-center @lg:justify-end'>
                <DeviceVitalsGroup deviceId={Number(deviceId)} />
              </div>
            </div>
          </div>
          <div className='flex-1 flex flex-col justify-center items-center'>
            {deviceVisualizationPending ? (
              <LoadingPing size="3xl" color="oklch(76.9% 0.188 70.08)" />
            ) : deviceVisualization ? (
              <DeviceDashboard
                deviceId={Number(deviceId)}
                data={deviceVisualization}
                searchParams={searchParams}
              />
            ) : (
              <ErrorComponent error={deviceVisualizationError}>
                <Button onClick={() => navigate({
                  to: Route.fullPath
                })}>
                  New Query
                </Button>
              </ErrorComponent>
            )}
          </div>
        </div>
      </FloatUpWrapper>
    </ViewShell>
  )
}