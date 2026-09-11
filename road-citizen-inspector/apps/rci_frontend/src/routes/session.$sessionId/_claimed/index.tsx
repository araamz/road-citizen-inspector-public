import { useQuery } from '@tanstack/react-query'
import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import useHydrateRecentSession from '@/hooks/mutations/recent_session/UseHydrateRecentSession'
import useCurrentAuthorizationOptions from '@/hooks/queries/authorization/UseCurrentAuthorizationOptions.suspense'

export const Route = createFileRoute('/session/$sessionId/_claimed/')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    await context.queryClient.ensureQueryData(useCurrentAuthorizationOptions())
  },
})

function RouteComponent() {
  const { data } = useQuery(useCurrentAuthorizationOptions())
  const { sessionId } = useParams({
    from: '/session/$sessionId',
  })
  const { mutateAsync } = useHydrateRecentSession(Number(sessionId))

  useEffect(() => {
    if (data?.session) mutateAsync(data.session)
  }, [mutateAsync, data])

  return <Navigate to="/session/$sessionId/project" params={{ sessionId }} />
}
