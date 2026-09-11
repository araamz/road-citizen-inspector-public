import { useMutation } from '@tanstack/react-query'
import type { UseMutationOptions } from '@tanstack/react-query'
import type { AuthorizationError } from '@/data/api/authorization/AuthorizationError'
import type { SessionError } from '@/data/api/session/SessionError'
import type { RemovedSessionData } from '@road-citizen-inspector/contracts'
import { patchRemoveSession } from '@/data/api/session/PatchRemoveSession'
import useDeleteRecentSession from '../recent_session/UseDeleteRecentSession'
import useAuthorization from '@/authorization/useAuthorization'

export function useRemoveSession(
  sessionId: number,
  options?: UseMutationOptions<
    RemovedSessionData,
    AuthorizationError | SessionError,
    void,
    RemovedSessionData
  >,
) {
  const {
    removeAuthorization: { mutateAsync: removeAuthorization },
  } = useAuthorization()
  const { mutateAsync: removeRecentSession } = useDeleteRecentSession(sessionId)

  return useMutation({
    mutationKey: ['user', 'update', 'session', 'remove'],
    mutationFn: () => patchRemoveSession(),
    onSuccess: () => {
      removeAuthorization()
        .then(() => removeRecentSession())
    },
    ...options,
  })
}
