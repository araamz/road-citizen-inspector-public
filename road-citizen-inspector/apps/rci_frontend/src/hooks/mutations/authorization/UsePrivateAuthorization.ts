import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query'
import { postPrivateAuthorization } from '@/data/api/authorization/PostPrivateAuthorization'
import type { PrivateAuthorizationSchema } from '@road-citizen-inspector/schemas'
import type { AuthorizationData } from '@road-citizen-inspector/contracts'
import type { AuthorizationError } from '@/data/api/authorization/AuthorizationError'

export function usePrivateAuthorization(
  options?: Partial<UseMutationOptions<
    AuthorizationData,
    AuthorizationError,
    PrivateAuthorizationSchema,
    AuthorizationError
  >>,
): UseMutationResult<
  AuthorizationData,
  AuthorizationError,
  PrivateAuthorizationSchema,
  AuthorizationError
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['authorization'],
    mutationFn: (params: PrivateAuthorizationSchema) =>
      postPrivateAuthorization(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['authorization'],
        exact: true
      })
    },
    ...options,
  })
}

export default usePrivateAuthorization
