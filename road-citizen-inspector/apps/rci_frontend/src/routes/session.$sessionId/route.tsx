import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/session/$sessionId')({
  component: RouteComponent,
    beforeLoad: async ({ context, params }) => {
      return await context.authorization
        .verifyAuthorization()
        .then((authorization) => {
          if (authorization.session.session_id !== Number(params.sessionId))
            throw new Error('Session is invalid.')
        })
        .catch(() => {
          throw redirect({
            to: '/authorization/$sessionId',
            params: {
              sessionId: params.sessionId,
            },
          })
        })
    }
})

function RouteComponent() {
  return <Outlet />
}
