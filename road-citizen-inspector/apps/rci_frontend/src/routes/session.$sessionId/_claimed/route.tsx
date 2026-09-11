import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { HiDocument, HiSignal, HiTableCells } from 'react-icons/hi2'
import ViewShell from '@/components/ViewShell'
import useCurrentAuthorizationOptions from '@/hooks/queries/authorization/UseCurrentAuthorizationOptions'

export const Route = createFileRoute('/session/$sessionId/_claimed')({
  component: RouteComponent,
  beforeLoad: async ({
    context: { authorization, queryClient },
    params,
    abortController,
  }) => {
    await authorization
      .verifyAuthorization(abortController)
      .then((auth) => {
        if (auth.session.status === 'unclaimed')
          throw new Error('Session is unclaimed.')
      })
      .then(() => {
        queryClient.ensureQueryData(useCurrentAuthorizationOptions())
      })
      .catch(() => {
        throw redirect({
          to: '/session/$sessionId/onboarding',
          params: {
            sessionId: params.sessionId,
          },
        })
      })
  },
})

function RouteComponent() {
  return (
    <ViewShell
      type="power"
      navigation={[
        {
          children: 'Project',
          icon: HiDocument,
          to: '/session/$sessionId/project',
        },
        {
          children: 'Devices',
          icon: HiSignal,
          to: '/session/$sessionId/device',
        },
        {
          children: 'Records',
          to: '/session/$sessionId/records',
          icon: HiTableCells,
        },
      ]}
    >
      <Outlet />
    </ViewShell>
  )
}
