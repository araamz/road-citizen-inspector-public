import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { HiArchiveBox } from 'react-icons/hi2'
import type { StatusQueryFormSchema } from '@/schemas/StatusQueryForm.schema'
import StatusQueryForm from '@/components/Forms/StatusQueryForm'
import SlideOverWrapper from '@/components/Motion/SlideOverWrapper'
import SectionLabel from '@/components/SectionLabel'
import { STATUS_QUEERY_FORM_SCHEMA } from '@/schemas/StatusQueryForm.schema'
import UsePaginatedStatusOptions from '@/hooks/queries/status/UsePaginatedStatusOptions'
import Pagination from '@/components/Pagination/Pagination'
import FallbackMessage from '@/components/FallbackMessage'
import StatusTable from '@/components/StatusTable'

export const Route = createFileRoute(
  '/session/$sessionId/_claimed/records/status',
)({
  component: RouteComponent,
  validateSearch: (unknown: Record<string, unknown>): StatusQueryFormSchema => {
    const parsed = STATUS_QUEERY_FORM_SCHEMA.parse(unknown)
    return {
      ...parsed
    }
  },
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()
  const { data: status, refetch } = useQuery(
    UsePaginatedStatusOptions({
      page: searchParams.page ? searchParams.page : null,
      size: searchParams.size ? searchParams.size : null,
      device_ids: searchParams.device_ids ?? [],
      sort_order: searchParams.sort_order ?? 'desc',
      device_battery_level_minimum:
        searchParams.device_battery_level_minimum ?? null,
      device_battery_level_maximum:
        searchParams.device_battery_level_maximum ?? null,
      device_storage_level_minimum:
        searchParams.device_storage_level_minimum ?? null,
      device_storage_level_maximum:
        searchParams.device_storage_level_maximum ?? null,
      status_capture_time_start: searchParams.status_capture_time_start ?? null,
      status_capture_time_end: searchParams.status_capture_time_end ?? null,
      device_sensor_status: searchParams.device_sensor_status ?? [],
    }),
  )

  const hanldeQuery = (query?: StatusQueryFormSchema) => {
    navigate({
      from: Route.fullPath,
      resetScroll: false,
      search: {
        ...query,
      },
    }).then(() => {
      console.log("searchParams - status", searchParams)
      refetch()
    })
  }

  return (
    <SlideOverWrapper>
      <article className="p-5 gap-10 relative flex flex-col @lg:flex-row h-full">
        <section className="@lg:px-1 w-full flex flex-col gap-10 @lg:w-1/4 @lg:min-w-[300px] @lg:max-w-[400px] @xl:w-full @xl:max-w-[400px] @lg:max-h-full @lg:overflow-y-auto">
          <div className="w-full">
            <SectionLabel textColor="black">Query Status</SectionLabel>
            <p className="text-neutral-700 text-base/relaxed">
              Search processed status messages sent from your Traffic Counting
              Devices (TCDs) through The Things Stack. These status messages are
              generated after uplinks are processed from your devices.
            </p>
          </div>
          <div>
            <StatusQueryForm
              initalValues={searchParams}
              formName="status-query-form"
              onSubmitCallback={(d) => hanldeQuery(d)}
              onResetCallback={() => hanldeQuery()}
            />
          </div>
        </section>
        <section className="flex flex-col w-full @lg:sticky @lg:top-16 @lg:h-min gap-5">
          {status && status.count > 0 ? (
            <>
              <StatusTable status={status.entries} />
              <Pagination
                onPageChange={(page) =>
                  navigate({
                    from: Route.fullPath,
                    search: (prev) => ({ ...prev, page }),
                  })
                }
                page={status.page}
                pages={status.pages}
                size={status.size}
                count={status.count}
              />
            </>
          ) : (
            <FallbackMessage icon={HiArchiveBox} size="lg">
              No status messages found. Please adjust your query parameters and
              try again.
            </FallbackMessage>
          )}
        </section>
      </article>
    </SlideOverWrapper>
  )
}
