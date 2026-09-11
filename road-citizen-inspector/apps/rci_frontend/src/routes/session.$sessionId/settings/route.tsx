import {
  Outlet,
  createFileRoute,
  redirect,
  useParams,
} from '@tanstack/react-router'
import { HiCog6Tooth, HiKey, HiSignal } from 'react-icons/hi2'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { ShellNavigationItemProps } from '@/components/ShellNavigation/ShellNavigationItem'
import ViewShell from '@/components/ViewShell'
import useCurrentAuthorizationOptions from '@/hooks/queries/authorization/UseCurrentAuthorizationOptions'
import useCurrentAuthorizationSuspenseOptions from '@/hooks/queries/authorization/UseCurrentAuthorizationOptions.suspense'

export const Route = createFileRoute('/session/$sessionId/settings')({
  component: RouteComponent,
  beforeLoad: async ({
    context: { queryClient, authorization },
    params,
    abortController,
  }) => {
    return await authorization
      .verifyAuthorization(abortController)
      .then((auth) => {
        if (auth.role !== 'administrator')
          throw redirect({
            to: '/session/$sessionId',
            params: {
              sessionId: params.sessionId,
            },
          })
        return authorization
      })
      .then(() => {
        queryClient.ensureQueryData(useCurrentAuthorizationOptions())
      })
  },
})

function RouteComponent() {
  const { sessionId } = useParams({
    from: '/session/$sessionId/settings',
  })

  const { data: session } = useSuspenseQuery(
    useCurrentAuthorizationSuspenseOptions(),
  )

  const navigation: Array<ShellNavigationItemProps> = useMemo(() => {
    if (session.session.status === 'claimed') {
      return [
        {
          to: '/session/$sessionId/settings',
          params: {
            sessionId,
          },
          children: 'General',
          icon: HiCog6Tooth,
          activeOptions: {
            exact: true,
          },
        },
        {
          to: '/session/$sessionId/settings/devices',
          params: {
            sessionId,
          },
          children: 'Devices',
          icon: HiSignal,
          activeOptions: {
            exact: true,
          },
        },
        {
          to: '/session/$sessionId/settings/keys',
          params: {
            sessionId,
          },
          children: 'Webhook Keys',
          icon: HiKey,
          activeOptions: {
            exact: true,
          },
        },
      ]
    }

    return [
      {
        to: '/session/$sessionId/settings',
        params: {
          sessionId,
        },
        children: 'General',
        icon: HiCog6Tooth,
        activeOptions: {
          exact: true,
        },
      },
      {
        to: '/session/$sessionId/settings/keys',
        params: {
          sessionId,
        },
        children: 'Webhook Keys',
        icon: HiKey,
        activeOptions: {
          exact: true,
        },
      },
    ]
  }, [session.session.status, sessionId])

  return (
    <ViewShell navigation={navigation}>
      <Outlet />
    </ViewShell>
  )
}
