import {
  Link,
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import {   useState } from 'react'
import { HiBookmark, HiChevronRight } from 'react-icons/hi2'
import { useDebounce } from '@uidotdev/usehooks'
import { toast } from 'react-hot-toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type {ChangeEvent, MouseEvent} from 'react';
import Button from '@/components/Button'
import HeroBadge from '@/components/Heros/HeroBadge'
import TextInput from '@/components/Inputs/TextInput'
import SessionPreview from '@/components/SessionPreview'
import useAuthorization from '@/authorization/useAuthorization'
import SlideOverWrapper from '@/components/Motion/SlideOverWrapper'
import useNewRecentSession from '@/hooks/mutations/recent_session/UseNewRecentSession'
import useRecentSession from '@/hooks/queries/recent_session/UseRecentSession'
import useExplicitSessionOptions from '@/hooks/queries/session/UseExplicitSessionOptions'

export const Route = createFileRoute('/authorization/$sessionId/administrator')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  const queryClient = useQueryClient()
  const { sessionId } = useParams({
    from: '/authorization/$sessionId',
  })

  const { data: session } = useQuery(
    useExplicitSessionOptions(Number(sessionId)),
  )

  const {
    requestAdministrativeAuthorization: { mutateAsync, isPending },
  } = useAuthorization()
  const [input, setInput] = useState<string>('')
  const [error, setError] = useState<string | undefined>(undefined)
  const debouncedPassword = useDebounce(input, 250)
  const navigate = useNavigate()

  const handleSessionPassword = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    setInput(event.target.value)
    event.target.focus()
  }

  const handleJoinSession = (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    event.preventDefault()
    const joinSession = mutateAsync({
      cred_session_id: Number(sessionId),
      cred_administrative_password: debouncedPassword,
    })
      .then((authorization) => {
        navigate({
          to: '/session/$sessionId/project',
          params: {
            sessionId,
          },
        })
        return authorization
      })
      .catch((error) => {
        setError(error.message)
        throw error
      })

    toast.promise(async () => await joinSession, {
      loading: 'Authorizing...',
      success: () => 'Successfully join session!',
      error: (error) => error.message,
    })
  }

  const { mutateAsync: bookmarkSession } = useNewRecentSession()
  const {
    data: recentSession,
    isPending: recentSessionPending,
  } = useQuery(useRecentSession(Number(sessionId), {
    retry: 1,
    retryDelay: 0
  }))
  const handleBookmarkSession = () => {
    if (!session) return

    bookmarkSession(session)
      .then(() => {
        toast.success('Successfully bookmarked session!')
        queryClient.resetQueries({
          queryKey: ['recent_session', session.session_id],
        })
      })
      .catch(() => {
        toast.error('Failed to bookmark session!')
        queryClient.resetQueries({
          queryKey: ['recent_session', session.session_id],
        })
      })
  }

  return (
    <SlideOverWrapper>
      <article className="flex flex-col gap-10 h-full min-h-full">
        <section className="flex flex-col gap-10 w-full @xl:flex-row  @xl:justify-center">
          <HeroBadge
            title="Make Session Changes"
            description="Need to make changes to the viewing of your sessions. Access the session as a administrator."
          />
          <div className="@container min-w-0 w-full flex flex-col gap-5 @xl:max-w-[500px]">
            <SessionPreview sessionId={Number(sessionId)} />
            <TextInput
              disabled={isPending}
              type="password"
              value={input}
              onChange={(e) => handleSessionPassword(e)}
              label="Administrative Password"
              description="Enter the administrator password to create a new authorization to make changes."
              error={error}
            />
            <div className="flex flex-col-reverse gap-x-5 gap-y-4 items-center @md:flex-row @md:justify-between">
              <Button
                disabled={
                  recentSessionPending || recentSession !== undefined
                }
                onClick={() => handleBookmarkSession()}
                startIcon={HiBookmark}
                variant="secondary"
              >
                Bookmark
              </Button>
              <Button
                size="md"
                disabled={isPending || debouncedPassword.trim() === ''}
                endIcon={HiChevronRight}
                onClick={(event) => handleJoinSession(event)}
              >
                Join Session
              </Button>
            </div>
          </div>
        </section>
        <footer>
          <p className="text-xs text-neutral-500 text-center">
            Want to join the session to view traffic studies insights. Sign into
            the session{' '}
            <span className="underline underline-offset-2 decoration-1">
              <Link
                to="/authorization/$sessionId"
                params={{ sessionId: sessionId }}
              >
                here
              </Link>
            </span>
            .
          </p>
        </footer>
      </article>
    </SlideOverWrapper>
  )
}
