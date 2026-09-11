import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { HiArchiveBox } from 'react-icons/hi2'
import type {ReadingQueryFormSchema} from '@/schemas/ReadingQueryForm.schema';
import SlideOverWrapper from '@/components/Motion/SlideOverWrapper'
import SectionLabel from '@/components/SectionLabel'
import ReadingQueryForm from '@/components/Forms/ReadingQueryForm'
import usePaginatedReadingsOptions from '@/hooks/queries/reading/UsePaginatedReadingsOptions'
import ReadingTable from '@/components/ReadingTable'
import FallbackMessage from '@/components/FallbackMessage'
import Pagination from '@/components/Pagination/Pagination'
import {
  READING_QUERY_FORM_SCHEMA
  
} from '@/schemas/ReadingQueryForm.schema'

export const Route = createFileRoute(
  '/session/$sessionId/_claimed/records/readings',
)({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): ReadingQueryFormSchema => {
    const parsed = READING_QUERY_FORM_SCHEMA.parse(search)
    return {
      sort_order: 'desc',
      ...parsed,
    }
  },
})

function RouteComponent() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate({
    from: '/session/$sessionId/records/readings',
  })
  const {
    data: readings,
    refetch,
  } = useQuery(
    usePaginatedReadingsOptions({
      page: searchParams.page ?? 1,
      size: searchParams.size ?? 10,
      vehicle_detection_time_start:
        searchParams.vehicle_detection_time_start ?? null,
      vehicle_detection_time_end:
        searchParams.vehicle_detection_time_end ?? null,
      sort_order: searchParams.sort_order ?? null,
      vehicle_speed_minimum: searchParams.vehicle_speed_minimum ?? null,
      vehicle_speed_maximum: searchParams.vehicle_speed_maximum ?? null,
      device_ids: searchParams.device_ids ?? null,
      vehicle_types: searchParams.vehicle_types ?? [],
      vehicle_directions: searchParams.vehicle_directions ?? [],
      vehicle_lanes: searchParams.vehicle_lanes ?? [],
      road_types: searchParams.road_types ?? [],
      road_primary_directions: searchParams.road_primary_directions ?? [],
      road_secondary_directions: searchParams.road_secondary_directions ?? [],
    }),
  )

  const hanldeQuery = (query?: ReadingQueryFormSchema) => {
    navigate({
      search: {
        ...query,
      },
    }).then(() => {
      refetch()
    })
  }

  return (
    <SlideOverWrapper>
      <article className="p-5 gap-10 relative flex flex-col @lg:flex-row h-full">
        <section className="@lg:px-1 w-full flex flex-col gap-10 @lg:w-1/4 @lg:min-w-[300px] @lg:max-w-[400px] @xl:w-full @xl:max-w-[400px] @lg:max-h-full @lg:overflow-y-auto">
          <div className="w-full">
            <SectionLabel textColor="black">Query Readings</SectionLabel>
            <p className="text-neutral-700 text-base/relaxed">
              Search processed readings sent from your Traffic Counting Devices
              (TCDs) through The Things Stack. These readings are generated
              after uplinks are processed from your devices.
            </p>
          </div>
          <div>
            <ReadingQueryForm
              onResetCallback={() => hanldeQuery()}
              initalValues={{
                ...searchParams,
              }}
              formName="reading-query-form"
              onSubmitCallback={(d) => hanldeQuery(d)}
            />
          </div>
        </section>
        <section className="flex flex-col w-full @lg:sticky @lg:top-16 @lg:h-min gap-5">
          {readings?.entries && readings.entries.length > 0 ? (
            <>
              <ReadingTable readings={readings.entries} />
              <Pagination
                onPageChange={(page) =>
                  navigate({
                    from: '/session/$sessionId/records/readings',
                    search: (prev) => ({ ...prev, page }),
                  })
                }
                page={readings.page}
                pages={readings.pages}
                size={readings.size}
                count={readings.count}
              />
            </>
          ) : (
            <FallbackMessage icon={HiArchiveBox} size="lg">
              No readings found. Please adjust your query parameters and try
              again.
            </FallbackMessage>
          )}
        </section>
      </article>
    </SlideOverWrapper>
  )
}
