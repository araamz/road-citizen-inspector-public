import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import useRecentSessions from '@/hooks/queries/recent_session/UseRecentSessions'
import RecentSessionItem from '@/components/RecentSessionItem'
import HeroBanner from '@/components/Heros/HeroBanner'
import ViewShell from '@/components/ViewShell'
import FloatUpWrapper from '@/components/Motion/FloatUpWrapper'
import ErrorComponent from '@/components/Suspense/ErrorComponent.suspense'
import Button from '@/components/Button'

export const Route = createFileRoute('/')({
  component: App,
  beforeLoad: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(useRecentSessions())
  },
  errorComponent: (error) => {
    const navigate = useNavigate()
    return (
      <ErrorComponent error={error.error}>
        <Button onClick={() => navigate({ to: "/"  })}>Dashboard</Button>
      </ErrorComponent>
    )
  },
})

function App() {
  const { data: recentSessions } = useSuspenseQuery(useRecentSessions())

  return (
    <FloatUpWrapper>
      <ViewShell>
        <div className="flex flex-col gap-10 h-full">
          <div>
            <HeroBanner
              title="Your Traffic Studies"
              description="View and access all your traffic studies in one place."
            />
          </div>
          <div className="flex flex-col gap-10 @2xl:grid @2xl:grid-cols-2 @6xl:grid-cols-3">
            {recentSessions.map((recentSession) => (
              <RecentSessionItem
                key={recentSession.sessionId}
                {...recentSession}
              />
            ))}
          </div>
        </div>
      </ViewShell>
    </FloatUpWrapper>
  )
}
