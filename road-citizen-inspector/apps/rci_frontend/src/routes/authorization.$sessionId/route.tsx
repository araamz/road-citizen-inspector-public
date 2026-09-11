import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import ViewShell from '@/components/ViewShell'
import useExplicitSessionOptions from '@/hooks/queries/session/UseExplicitSessionOptions'
import ErrorComponent from '@/components/Suspense/ErrorComponent.suspense'
import Button from '@/components/Button'

export const Route = createFileRoute('/authorization/$sessionId')({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    return await context.queryClient
      .ensureQueryData(useExplicitSessionOptions(Number(params.sessionId)))
      .catch((error) => {
        throw error
      })
  },
  errorComponent: (error) => {
    const navigate = useNavigate()
    return (
      <div className='h-full w-full flex grow'>
      <ErrorComponent error={error.error}>
        <Button onClick={() => navigate({to: '/'})}>Dashboard</Button>
      </ErrorComponent>
      </div>
    )
  },
})

function RouteComponent() {
  return (
    <ViewShell>
      <Outlet />
    </ViewShell>
  )
}
