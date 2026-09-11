import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type {MouseEvent} from 'react';
import FloatUpWrapper from '@/components/Motion/FloatUpWrapper'
import ViewShell from '@/components/ViewShell'
import HeroBadge from '@/components/Heros/HeroBadge'
import SessionPreview from '@/components/SessionPreview'
import CountdownClock from '@/components/CountdownClock/CountdownClock'
import Button from '@/components/Button'
import SectionLabel from '@/components/SectionLabel'
import Container from '@/components/Container'
import Accordion from '@/components/Accordion'
import SessionStatus from '@/components/SessionStatus'
import Skeleton from '@/components/Skeleton'
import useAuthorization from '@/authorization/useAuthorization'
import SessionClaimDirections from '@/components/SessionClaimDirections'
import useCurrentAuthorizationOptions from '@/hooks/queries/authorization/UseCurrentAuthorizationOptions.suspense';

export const Route = createFileRoute('/session/$sessionId/onboarding')({
  beforeLoad: async ({ context }) => {
    await context.queryClient
      .ensureQueryData(useCurrentAuthorizationOptions())
      .then((authorization) => {
        if (authorization.session.status === 'claimed')
          throw redirect({
            to: '/session/$sessionId',
            params: {
              sessionId: String(authorization.session.session_id),
            },
          })
      })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data: authorization, isPending } = useQuery(useCurrentAuthorizationOptions())
  const { role, removeAuthorization } = useAuthorization()
  const { mutateAsync, isPending: authorizationRemovalPending } =
    removeAuthorization
  const navigate = useNavigate()

  const handleEndSession = (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    event.preventDefault()

    const removeSession = mutateAsync().then(() =>
      navigate({
        to: '/',
      }),
    )

    toast.promise(removeSession, {
      loading: 'Ending session...',
      success: () => 'Successfully left session!',
      error: (error) => `Error occurred leaving session. ${error.message}`,
    })
  }

  return (
    <FloatUpWrapper>
      <ViewShell>
        <article className="flex flex-col gap-10 @lg:flex @lg:items-center w-full ">
          <div className="w-full pb-10 border-b border-b-neutral-300">
            <CountdownClock
              label="Time Remaining"
              endingTime={authorization?.session ? new Date(authorization.session.created_at) : undefined}
            />
          </div>
          {role === 'administrator' && authorization?.session.status === 'unclaimed' ? (
            <SessionClaimDirections />
          ) : undefined}
          <div className="flex flex-col w-full gap-10 @xl:flex-row @lg:max-w-[800px]">
            <HeroBadge
              title="Awaiting Traffic Insights"
              description="Sessions require uplinks to visualize data from Traffic Control Devices. Please allow up to 24 hours for uplinks to be received."
            />
            <div className="flex flex-col gap-10 w-full">
              <div className="w-full flex flex-col gap-10">
                <div className="flex flex-col w-full">
                  <SectionLabel textColor="black" size="lg">
                    Session Status
                  </SectionLabel>
                  <Container className="@container w-full">
                    <Skeleton
                      className="w-full"
                      height="lg"
                      isLoading={isPending}
                    >
                      <div className="flex flex-col items-center @xs:flex-row gap-5">
                        <SessionStatus status={authorization!.session.status} />
                        <div className="flex flex-col gap-1 text-center @xs:text-left">
                          <h3 className="font-semibold">
                            {authorization!.session.status === 'unclaimed'
                              ? 'Please try again later...'
                              : 'This session is expired...'}
                          </h3>
                          <p>
                            {authorization!.session.status === 'unclaimed'
                              ? "This session hasn't benn claimed by an Things Stack application."
                              : "This session wasn't claimed by an Things Stack application and now is invalid."}
                          </p>
                        </div>
                      </div>
                    </Skeleton>
                  </Container>
                </div>
                <div className="flex flex-col w-full">
                  <SectionLabel textColor="black" size="lg">
                    Session Information
                  </SectionLabel>
                  <SessionPreview
                    showVisualization={false}
                    sessionId={authorization!.session.session_id}
                  />
                </div>
              </div>
              <div>
                <SectionLabel textColor="black" size="lg">
                  Frequenctly Asked Questions (FAQ)
                </SectionLabel>
                <div className="flex flex-col gap-5">
                  <Accordion label="What does 'Unclaimed' mean?">
                    The session has not received data from your traffic counting
                    device(s) (TCD). Once an uplink has arrived from your TCD,
                    this session becomes claimed by the session's administrator
                    Thing Stack instance.
                  </Accordion>
                  <Accordion label="What does 'Expired' mean?">
                    Once the 24 hours grace period has elapsed, the session is
                    expired. Uplinks can't be received anymore by the Things
                    Stack for this session.
                  </Accordion>
                </div>
              </div>
              <div className="border-t-1 border-neutral-300 pt-5 flex justify-end">
                <Button
                  onClick={(event) => handleEndSession(event)}
                  disabled={authorizationRemovalPending}
                >
                  Leave Session
                </Button>
              </div>
            </div>
          </div>
        </article>
      </ViewShell>
    </FloatUpWrapper>
  )
}
