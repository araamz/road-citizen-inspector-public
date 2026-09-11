import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query'
import { postPublicAuthorization } from '@/data/api/authorization/PostPublicAuthorization'
import type { PublicAuthorizationSchema } from '@road-citizen-inspector/schemas'
import type { AuthorizationData } from '@road-citizen-inspector/contracts'
import type { AuthorizationError } from '@/data/api/authorization/AuthorizationError'

export function usePublicAuthorization(
  options?: Partial<UseMutationOptions<
    AuthorizationData,
    AuthorizationError,
    PublicAuthorizationSchema,
    AuthorizationError
  >>,
): UseMutationResult<
  AuthorizationData,
  AuthorizationError,
  PublicAuthorizationSchema,
  AuthorizationError
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['authorization'],
    mutationFn: (params: PublicAuthorizationSchema) =>
      postPublicAuthorization(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['authorization'],
        exact: true
      })
    },
    ...options,
  })
}

export default usePublicAuthorization
