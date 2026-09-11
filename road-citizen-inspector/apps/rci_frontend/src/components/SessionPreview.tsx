import { useQuery } from '@tanstack/react-query'
import DisabledCover from './DisabledCover'
import Skeleton from './Skeleton'
import Container from './Container'
import SessionPreviewVisualization from './Visualizations/SessionPreviewVisualization'
import useExplicitSessionOptions from '@/hooks/queries/session/UseExplicitSessionOptions'

export type SessionPreviewProps = {
  sessionId: number
  showVisualization?: boolean,
}
export default function SessionPreview({
  sessionId,
  showVisualization = true,
}: SessionPreviewProps) {

  const { data, isPending } = useQuery(useExplicitSessionOptions(sessionId))

  function readableDate() {
    if (!data?.created_at) return ''

    const date = new Date(data.created_at)

    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }

    const formatted = date.toLocaleString('en-US', options)

    const day = date.getDate()
    const suffix =
      day % 10 === 1 && day !== 11
        ? 'st'
        : day % 10 === 2 && day !== 12
          ? 'nd'
          : day % 10 === 3 && day !== 13
            ? 'rd'
            : 'th'

    const formattedWithSuffix = formatted.replace(
      new RegExp(`\\b${day}\\b`),
      `${day}${suffix}`,
    )
    return formattedWithSuffix
  }

  const SessionVisualization = () => {
    if (data?.visibility === "private") return <DisabledCover type='information'>
      Visualization Previews are not available for private sessions.
    </DisabledCover>
    else if (data?.status !== "claimed") return <DisabledCover type='information'>
      Visualization Previews can't be generated for unclaimed sessions.
    </DisabledCover>

    return <SessionPreviewVisualization sessionId={sessionId} />
  }

  return (
    <div className="group @container/session-preview">
      <Container className="w-full">
        <article className="flex  flex-col gap-5 ">
          <header className="flex flex-col items-center gap-2">
            <div className="flex flex-col gap-2 w-full items-center">
              <Skeleton height="lg" className="w-full" isLoading={isPending}>
                <h3 className="text-black text-2xl font-semibold text-center">
                  {data?.title}
                </h3>
              </Skeleton>
              <Skeleton height="xs" className="w-1/4" isLoading={isPending}>
                <p className="bg-neutral-300 text-neutral-500 px-2 py-1 w-fit text-xs rounded-lg mb-4">
                  Session ID:{' '}
                  <span className="font-semibold">{data?.session_id}</span>
                </p>
              </Skeleton>
            </div>
            <Skeleton
              isLoading={isPending}
              height="sm"
              className="mx-auto w-3/4"
            >
              <p className="text-center text-neutral-500 font-medium">
                {data?.description}
              </p>
            </Skeleton>
          </header>
          {showVisualization ? (
            <section className="h-[150px] w-full flex flex-col">
              <Skeleton
                isLoading={isPending}
                height="container"
                className="w-full"
              >
                <SessionVisualization />
              </Skeleton>
            </section>
          ) : undefined}
          <footer>
            <Skeleton
              isLoading={isPending}
              height="xs"
              className="w-1/3 mx-auto"
            >
              <p className="text-center text-xs font-medium text-neutral-500">
                Created {readableDate()}
              </p>
            </Skeleton>
          </footer>
        </article>
      </Container>
    </div>
  )
}
