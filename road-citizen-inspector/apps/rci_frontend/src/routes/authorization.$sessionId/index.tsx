import {
  Link,
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import { HiBookmark, HiChevronRight } from 'react-icons/hi2'
// Using Suspense Query to get if the session is a private or public session and display the password box
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {   useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { toast } from 'react-hot-toast'
import type {ChangeEvent, MouseEvent} from 'react';
import useExplicitSessionOptions from '@/hooks/queries/session/UseExplicitSessionOptions'
import SessionPreview from '@/components/SessionPreview'
import TextInput from '@/components/Inputs/TextInput'
import HeroBadge from '@/components/Heros/HeroBadge'
import Button from '@/components/Button'
import useAuthorization from '@/authorization/useAuthorization'
import SlideOverWrapper from '@/components/Motion/SlideOverWrapper'
import useNewRecentSession from '@/hooks/mutations/recent_session/UseNewRecentSession'
import useRecentSession from '@/hooks/queries/recent_session/UseRecentSession'

export const Route = createFileRoute('/authorization/$sessionId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const { sessionId } = useParams({
    from: '/authorization/$sessionId',
  })

  const { data: session } = useQuery(
    useExplicitSessionOptions(Number(sessionId)),
  )
  const {
    requestPrivateAuthorization: {
      mutateAsync: requestPrivateAuthorization,
      isPending: privateAuthorizationPending,
    },
    requestPublicAuthorization: {
      mutateAsync: requestPublicAuthorization,
      isPending: publicAuthorizationPending,
    },
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

  const handleJoinSession = (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    event.preventDefault()
    let promise: Promise<void>
    if (session?.visibility === 'private')
      promise = requestPrivateAuthorization({
        cred_password: debouncedPassword,
        cred_session_id: Number(sessionId),
      })
        .then(() =>
          navigate({
            to: '/session/$sessionId/project',
            params: {
              sessionId,
            },
          }),
        )
        .catch((error) => {
          setError(error.message)
          throw error
        })
    else
      promise = requestPublicAuthorization({
        cred_session_id: Number(sessionId),
      })
        .then(() =>
          navigate({
            to: '/session/$sessionId/project',
            params: {
              sessionId,
            },
          }),
        )
        .catch((error) => {
          throw error
        })
    toast.promise(() => promise, {
      loading: 'Authorizing...',
      success: () => 'Successfully accessed session!',
      error: (error: Error) => error.message || 'Failed to access session.',
    })
  }

  return (
    <SlideOverWrapper>
      <article className="flex flex-col gap-10 h-full min-h-full">
        <section className="flex flex-col gap-10 w-full @xl:flex-row  @xl:justify-center">
          <HeroBadge
            title="Access Session"
            description="One click away from gaining insights to traffic visualizations and records."
          />
          <div className="@container min-w-0 w-full flex flex-col gap-5 @xl:max-w-[500px] ">
            <SessionPreview sessionId={Number(sessionId)} />
            {session?.visibility == 'private' ? (
              <TextInput
                disabled={privateAuthorizationPending}
                type="password"
                value={input}
                onChange={(e) => handleSessionPassword(e)}
                label="Session Password"
                description="Enter the session password to access the session."
                error={error}
              />
            ) : undefined}
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
                disabled={
                  privateAuthorizationPending ||
                  publicAuthorizationPending ||
                  (session?.visibility === 'private' &&
                    debouncedPassword.trim() === '')
                }
                size="md"
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
            Want to join as the session administrator and make changes? Sign in
            using your administrator password{' '}
            <span className="underline underline-offset-2 decoration-1">
              <Link
                to="/authorization/$sessionId/administrator"
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
