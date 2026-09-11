import { useQuery } from '@tanstack/react-query'
import {
  HiEye,
  HiMiniArchiveBox,
  HiMiniCalendar,
  HiMiniCheckBadge,
  HiMiniClock,
  HiMiniServer,
  HiMiniUser,
} from 'react-icons/hi2'
import Container from './Container'
import Skeleton from './Skeleton'
import Chiclet from './Chiclet/Chiclet'
import useCurrentAuthorizationOptions from '@/hooks/queries/authorization/UseCurrentAuthorizationOptions.suspense'

export type SessionSummaryProps = {
  showSessionVisibility?: boolean
  showSessionStatus?: boolean
  showProjectId?: boolean
  showTtsAppId?: boolean
  showCreatedAt?: boolean
  showActiveAt?: boolean
  showUpdatedAt?: boolean
}

export default function SessionSummary({
  showSessionVisibility = true,
  showSessionStatus = true,
  showProjectId = true,
  showTtsAppId = true,
  showCreatedAt = true,
  showActiveAt = true,
  showUpdatedAt = true,
}: SessionSummaryProps) {
  const { data, isPending } = useQuery(useCurrentAuthorizationOptions())

  const renderStatus = () => {
    if (data?.session.status === 'claimed') return 'Claimed'
    if (data?.session.status === 'unclaimed') return 'Unclaimed'
    if (data?.session.status === 'expired') return 'Expired'
    return '-'
  }

  return (
    <Container className="@container">
      <div className="flex flex-col gap-10 @lg:grid @lg:grid-cols-2">
        <header className="flex flex-col items-center gap-2 @lg:items-start">
          <div className="flex flex-col gap-2 w-full items-center @lg:items-start">
            <Skeleton height="lg" className="w-full" isLoading={isPending}>
              <h3 className="text-black text-2xl font-semibold text-center @lg:text-left">
                {data?.session.title}
              </h3>
            </Skeleton>

            <Skeleton height="xs" className="w-1/4" isLoading={isPending}>
              <p className="bg-neutral-300 text-neutral-500 px-2 py-1 w-fit text-xs rounded-lg mb-4">
                Session ID:{' '}
                <span className="font-semibold">
                  {data?.session.session_id}
                </span>
              </p>
            </Skeleton>
          </div>

          <Skeleton isLoading={isPending} height="sm" className="mx-auto w-3/4">
            <p className="text-center text-neutral-400 @lg:text-left">
              {data?.session.description}
            </p>
          </Skeleton>
        </header>

        <section className="@container/chiclets w-full">
          <div className="flex flex-col gap-5 @xs/chiclets:grid @xs/chiclets:grid-cols-2">
            {showSessionVisibility && (
              <Skeleton isLoading={isPending} height="sm" className="w-full">
                <Chiclet title="Visibility" icon={HiEye}>
                  {data?.session.visibility === 'public' ? 'Public' : 'Private'}
                </Chiclet>
              </Skeleton>
            )}

            {showSessionStatus && (
              <Skeleton isLoading={isPending} height="sm" className="w-full">
                <Chiclet title="Status" icon={HiMiniCheckBadge}>
                  {renderStatus()}
                </Chiclet>
              </Skeleton>
            )}

            {showProjectId && data?.session.project_id && (
              <Skeleton isLoading={isPending} height="sm" className="w-full">
                <Chiclet title="Project ID" icon={HiMiniArchiveBox}>
                  {String(data.session.project_id)}
                </Chiclet>
              </Skeleton>
            )}

            {showTtsAppId && data?.session.tts_app_id && (
              <Skeleton isLoading={isPending} height="sm" className="w-full">
                <Chiclet title="Application ID (TTS)" icon={HiMiniServer}>
                  {String(data.session.tts_app_id)}
                </Chiclet>
              </Skeleton>
            )}

            {showCreatedAt && (
              <span className="col-span-2 @sm:col-span-1">
                <Skeleton isLoading={isPending} height="sm" className="w-full">
                  <Chiclet title="Created" icon={HiMiniCalendar}>
                    {new Date(data!.session.created_at).toLocaleString()}
                  </Chiclet>
                </Skeleton>
              </span>
            )}

            {showActiveAt && data?.session.active_at && (
              <span className="col-span-2 @sm:col-span-1">
                <Skeleton isLoading={isPending} height="sm" className="w-full">
                  <Chiclet title="Last Active" icon={HiMiniUser}>
                    {new Date(data.session.active_at).toLocaleString()}
                  </Chiclet>
                </Skeleton>
              </span>
            )}

            {showUpdatedAt && data?.session.updated_at && (
              <span className="col-span-2 @sm:col-span-1">
                <Skeleton isLoading={isPending} height="sm" className="w-full">
                  <Chiclet title="Last Updated" icon={HiMiniClock}>
                    {new Date(data.session.updated_at).toLocaleString()}
                  </Chiclet>
                </Skeleton>
              </span>
            )}
          </div>
        </section>
      </div>
    </Container>
  )
}