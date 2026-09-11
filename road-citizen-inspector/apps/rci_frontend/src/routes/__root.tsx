import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import type { QueryClient } from '@tanstack/react-query'
import type { AuthorizationContext } from '@/authorization/AuthorizationContext'
import Header from '@/components/Header'

interface MyRouterContext {
  queryClient: QueryClient
  authorization: AuthorizationContext
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div className="overscroll-none flex flex-col min-h-dvh max-h-dvh bg-neutral-100 overflow-hidden lg:flex-row">
      <Header />
      <div
        id="app-scroll"
        className="overscroll-none flex flex-col grow overflow-auto w-full"
      >
        <Outlet />
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            'bg-neutral-800/80! text-base/snug! backdrop-blur shadow-md! mb-2 rounded-lg flex gap-2 items-center px-6! text-white/70!',
        }}
      />
      {process.env.NODE_ENV === 'development' && (
        <TanStackDevtools
          config={{
            hideUntilHover: true,
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
      )}
    </div>
  ),
})
