import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { HiArchiveBox } from 'react-icons/hi2'
import type { UplinkQueryFormSchema } from '@/schemas/UplinkQueryForm.schema'
import UplinkQueryForm from '@/components/Forms/UplinkQueryForm'
import SlideOverWrapper from '@/components/Motion/SlideOverWrapper'
import SectionLabel from '@/components/SectionLabel'
import useProjectDevicesSuspenseOptions from '@/hooks/queries/device/UseProjectDevicesOptions.suspense'
import { UPLINK_QUERY_FORM_SCHEMA } from '@/schemas/UplinkQueryForm.schema'
import usePaginatedUplinksOptions from '@/hooks/queries/uplink/UsePaginatedUplinksOptions'
import UplinkTable from '@/components/UplinkTable'
import Pagination from '@/components/Pagination/Pagination'
import FallbackMessage from '@/components/FallbackMessage'

export const Route = createFileRoute(
  '/session/$sessionId/_claimed/records/uplinks',
)({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): UplinkQueryFormSchema => {
    const parsed = UPLINK_QUERY_FORM_SCHEMA.parse(search)

    return {
      ...parsed,
    }
  },
})

function RouteComponent() {
  const { data: devices } = useSuspenseQuery(useProjectDevicesSuspenseOptions())
  const searchParams = Route.useSearch()
  const { data, refetch } = useQuery(
    usePaginatedUplinksOptions({
      unprocessed: searchParams.unprocessed ? searchParams.unprocessed : null,
      processed: searchParams.processed ? searchParams.processed : null,
      failed: searchParams.failed ? searchParams.failed : null,
      sort_order: searchParams.sort_order ? searchParams.sort_order : null,
      created_at_start: searchParams.created_at_start
        ? new Date(searchParams.created_at_start)
        : null  ,
      created_at_end: searchParams.created_at_end
        ? new Date(searchParams.created_at_end)
        : null,
      updated_at_start: searchParams.updated_at_start
        ? new Date(searchParams.updated_at_start)
        : null,
      updated_at_end: searchParams.updated_at_end
        ? new Date(searchParams.updated_at_end)
        : null,
      page: searchParams.page ? searchParams.page : null,
      size: searchParams.size ? searchParams.size : null,
    }),
  )
  const navigate = useNavigate()

  const handleQuery = (query?: UplinkQueryFormSchema) => {

    navigate({
      from: '/session/$sessionId/records/uplinks',
      resetScroll: false,
      search: {
        ...query
      }
    }).then(() => {
      refetch()
    })
  }

  return (
    <SlideOverWrapper>
      <article className="p-5 gap-10 relative flex flex-col @lg:flex-row h-full">
        <section className="@lg:px-1 w-full flex flex-col gap-10 @lg:w-1/4 @lg:min-w-[300px] @lg:max-w-[400px] @xl:w-full @xl:max-w-[400px] @lg:max-h-full @lg:overflow-y-auto">
          <div className="w-full">
            <SectionLabel textColor="black">Query Uplinks</SectionLabel>
            <p className="text-neutral-700 text-base/relaxed">
              Search incoming messages sent from your Traffic Counting Devices
              (TCDs) through The Things Stack. These messages enter your session
              before being processed into readings or status updates.
            </p>
          </div>
          <UplinkQueryForm
            formName="uplink-query-form"
            onResetCallback={() => handleQuery()}
            onSubmitCallback={(d) => handleQuery(d)}
            devices={devices}
            initialValues={searchParams}
          />
        </section>
        <section className="w-full @lg:sticky @lg:top-16 @lg:h-min">
          {data && data.count > 0 ? (
            <div className="flex flex-col gap-5">
              <UplinkTable data={data.entries} />
                <Pagination
                  onPageChange={(page) =>
                    navigate({
                      from: Route.fullPath,
                      search: (prev) => ({ ...prev, page }),
                    })
                  }
                  page={data.page}
                  pages={data.pages}
                  size={data.size}
                  count={data.count}
                />
              </div>
          ) : (
            <FallbackMessage size="lg" icon={HiArchiveBox}>
              No uplinks found.
            </FallbackMessage>
          )}
        </section>
      </article>
    </SlideOverWrapper>
  )
}
