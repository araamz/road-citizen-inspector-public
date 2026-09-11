import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/session/$sessionId/_claimed/records/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { sessionId } = useParams({
    from: "/session/$sessionId/_claimed/records"
  })

  return <Navigate to="/session/$sessionId/records/uplinks" params={{sessionId}} />
}
