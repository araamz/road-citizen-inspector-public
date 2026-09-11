import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TbChartHistogram } from 'react-icons/tb'
import { BiWater } from 'react-icons/bi'
import { useQuery } from '@tanstack/react-query'
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'
import { useMemo, useState } from 'react'
import _ from 'lodash'
import { toast } from 'react-hot-toast'
import type { MouseEvent } from 'react';
import type { VisualizationDevice } from '@/components/Inputs/VisualizationInputs/VisualizationDeviceCombobox';
import type { VisualizationInterval } from '@/components/Inputs/VisualizationInputs/VisualizationIntervalSelect';
import FloatUpWrapper from '@/components/Motion/FloatUpWrapper'
import LinkGroup from '@/components/LinkGroup/LinkGroup'
import LinkGroupItem from '@/components/LinkGroup/LinkGroupItem'
import CompositeFilters from '@/components/CompositeFilters'

import useProjectDevicesOptions from '@/hooks/queries/device/UseProjectDevicesOptions'
import useProjectDevicesSuspenseOptions from '@/hooks/queries/device/UseProjectDevicesOptions.suspense'
import useProjectDeviceConfigurations from '@/hooks/queries/device/UseProjectDeviceConfigurations'
import useDateFormatter from '@/hooks/utilities/useDateFormatter'
import UseCompositeVisualizationOptions from '@/hooks/queries/visualization/UseCompositeVisualizationOptions'
import CompositeProjectDashboard from '@/components/ContentDashboards/CompositeProjectDashboard'
import LoadingPing from '@/components/LoadingPing'
import ErrorComponent from '@/components/Suspense/ErrorComponent.suspense'
import Button from '@/components/Button'
import useAuthorization from '@/authorization/useAuthorization'

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

const COMPOSITE_SEARCH_PARAMS_SCHEMA = z.object({
  start: fallback(z.string().datetime(), COMPUTE_START_DATETIME().toISOString()).default(COMPUTE_START_DATETIME().toISOString()),
  end: fallback(z.string().datetime(), COMPUTE_END_DATETIME().toISOString()).default(COMPUTE_END_DATETIME().toISOString()),
  interval: fallback(z.enum(TIME_INTERVALS_MINS), DEFAULT_TIME_INTERVAL).default(DEFAULT_TIME_INTERVAL),
  deviceIds: fallback(z.array(z.string()), []).default([])
})

export const Route = createFileRoute('/session/$sessionId/_claimed/project')({
  validateSearch: zodValidator(COMPOSITE_SEARCH_PARAMS_SCHEMA),
  beforeLoad: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData((useProjectDevicesSuspenseOptions()))
  },
  component: RouteComponent,
  errorComponent: (error) => {
    const navigate = useNavigate({
      from: Route.fullPath
    })
    const { session } = useAuthorization()
    return (
      <ErrorComponent error={error.error}>
        {session !== null ? (
          <Button onClick={() => navigate({
            to: "/session/$sessionId/project",
            params: {
              sessionId: String(session.session_id)
            }
          })}>
            New Query
          </Button>
        ) : (
          <Button onClick={() => navigate({
            to: "/",
          })}>
            Dashboard
          </Button>
        )}
      </ErrorComponent>
    )
  }
})
function RouteComponent() {

  // Accessors for Filtering State
  const navigate = useNavigate({
    from: Route.fullPath
  })
  const searchParams = Route.useSearch()

  const { isMultiDay } = useDateFormatter()

  // Handlers for Filtering State Change
  const [filterState, setFilterState] = useState<{
    interval: string,
    deviceIds: Array<string>,
    start: string,
    end: string;
  }>({
    interval: searchParams.interval,
    deviceIds: searchParams.deviceIds,
    start: searchParams.start,
    end: searchParams.end
  })

  const handleStartTimestampChange = (timestamp: string) => {
    setFilterState((prev) => ({
      ...prev,
      start: timestamp
    }))
  }

  const handleEndTimestampChange = (timestamp: string) => {
    setFilterState((prev) => ({
      ...prev,
      end: timestamp
    }))
  }

  const handleDeviceSelection = (selections: Array<VisualizationDevice>) => {
    setFilterState((prev) => ({
      ...prev,
      deviceIds: selections.map((selection) => String(selection.deviceId))
    }))
  }

  const handleIntervalSelection = (intervalSelection: VisualizationInterval) => {
    setFilterState((prev) => ({
      ...prev,
      interval: intervalSelection.value
    }))
  }

  const handleFilterQuery = async (event: MouseEvent<HTMLButtonElement>) => {

    event.preventDefault()

    const startDateTime = new Date(filterState.start).getTime()
    const endDateTime = new Date(filterState.end).getTime()

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
        ...filterState,
        start: new Date(filterState.start).toISOString(),
        end: new Date(filterState.end).toISOString(),
      })
    })
  }

  const handleResetQuery = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setFilterState(() => searchParams)
  }

  // Fetched Data
  const { data: projectDevicesIds, isFetched: projectDeviceIdsFetched } = useQuery(
    useProjectDevicesOptions<number>({
      select: (devices) => devices.map((d) => d.device_id),
      placeholderData: () => [],
    })
  )
  const { data: visualizationDevices, isPending: visualizationDevicesPending } = useQuery(
    useProjectDeviceConfigurations<VisualizationDevice>((projectDevicesIds || []), {
      enabled: projectDeviceIdsFetched,
      select: (devices) => devices.map((cfg) => ({
        label: cfg.device.label === null ? undefined : cfg.device.label,
        deviceId: cfg.device.device_id,
        isPinned: cfg.device.is_pinned,
        ttsDeviceId: cfg.device.tts_device_id,
        configurationString: cfg.configuration ?
          `${cfg.configuration.road_type.toUpperCase()}, ${cfg.configuration.road_primary_direction.charAt(0).toUpperCase() + String(cfg.configuration.road_primary_direction.slice(1))}` : undefined
      }))
    })
  )

  const { data, isPending } = useQuery(
    UseCompositeVisualizationOptions({
      visualizationStart: new Date(searchParams.start),
      visualizationEnd: new Date(searchParams.end),
      intervalDurationMinutes: Number(searchParams.interval),
      device_ids: searchParams.deviceIds.map((id) => Number(id)),
      includeData: true
    }),
  )

  // Processors for Derived State
  const showDay = useMemo(() => isMultiDay(new Date(searchParams.start), new Date(searchParams.end)), [isMultiDay, searchParams.start, searchParams.end])

  const selectedInterval = useMemo(() => {
    return TIME_INTERVALS.find((timeInterval) => timeInterval.value === filterState.interval) || TIME_INTERVALS[0]
  }, [filterState.interval])

  const selectedVisualizationDevices = useMemo(() =>
    visualizationDevices?.filter((vs) => filterState.deviceIds.includes(String(vs.deviceId))) || []
    , [visualizationDevices, filterState.deviceIds])

  const maxVehicleCount = useMemo(() => {
    return data?.bins.reduce((acc, bin) => {
      return acc += bin.processed.vehicleCounts.cumulative
    }, 0) || 0
  }, [data])

  // Helper Functions
  const formatLocalISOTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const isSearchStale = useMemo(() => {

    const normalizedSearchParams = {
      ...searchParams,
      start: new Date(searchParams.start).getTime(),
      end: new Date(searchParams.end).getTime()
    }

    const normalizedFilterState = {
      ...filterState,
      start: new Date(filterState.start).getTime(),
      end: new Date(filterState.end).getTime()
    }

    return _.isEqual(normalizedSearchParams, normalizedFilterState)
  }, [searchParams, filterState])

  return (
    <FloatUpWrapper>
      <article
        className="
        flex flex-col w-full p-5 gap-5
        min-h-full h-full max-w-full 
      "
      >
        {/* Filtering Options */}
        <header className="
          flex justify-between items-end gap-x-2.5

          @3xl:col-start-1 @3xl:col-end-7
          @3xl:row-start-1 @3xl:row-end-2

          @6xl:col-start-1 @6xl:col-end-4
          @6xl:row-start-1 @6xl:row-end-2
      ">
          <div>
            <LinkGroup label='Visualization'>
              <LinkGroupItem
                to="/session/$sessionId/project/histogram"
                label="Histogram"
                previewElement={<TbChartHistogram />}
                search={(prev) => ({
                  ...prev
                })}
              />
              <LinkGroupItem
                to="/session/$sessionId/project/themeriver"
                label="ThemeRiver"
                search={(prev) => ({
                  ...prev
                })}
                previewElement={<BiWater />}
              />
            </LinkGroup>
          </div>
          <div className='grow'>
            <CompositeFilters
              intervalProps={{
                intervalValue: selectedInterval,
                intervals: TIME_INTERVALS,
                setInterval: (i) => handleIntervalSelection(i)
              }}
              deviceProps={{
                disabled: visualizationDevicesPending,
                devices: visualizationDevices ? visualizationDevices : [],
                selectedDevices: selectedVisualizationDevices,
                setSelectedDevices: (d) => handleDeviceSelection(d)
              }}
              startTimestampProps={{
                label: "Start Timestamp",
                description: "Set the starting timestamp for the visualization.",
                timestampValue: searchParams.start === filterState.start ? formatLocalISOTimestamp(searchParams.start) : filterState.start,
                setTimestamp: (t) => handleStartTimestampChange(t),
              }}
              endTimestampProps={{
                label: "End Timestamp",
                description: "Set the ending timestamp for the visualization.",
                timestampValue: searchParams.end === filterState.end ? formatLocalISOTimestamp(searchParams.end) : filterState.end,
                setTimestamp: (t) => handleEndTimestampChange(t),
              }}

              query={{
                handler: (e) => handleFilterQuery(e),
                disabled: isSearchStale
              }}
              reset={{
                handler: (e) => handleResetQuery(e),
                disabled: isSearchStale
              }}
            />
          </div>
        </header>
        <div className='flex-1 flex'>
          {!isPending && data ? (
            <CompositeProjectDashboard
              compositeData={data}
              showDay={showDay}
              maxVehicleCount={maxVehicleCount}
            />
          ) : (
            <div className='flex-1 flex items-center justify-center'>
              <LoadingPing size='3xl' color='oklch(76.9% 0.188 70.08)' />
            </div>
          )}
        </div>
      </article>
    </FloatUpWrapper>
  )
}
