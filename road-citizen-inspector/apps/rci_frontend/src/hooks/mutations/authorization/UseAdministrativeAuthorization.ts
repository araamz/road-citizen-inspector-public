import {
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import type {UseMutationOptions, UseMutationResult} from '@tanstack/react-query';
import type { AdministrativeAuthorizationSchema } from '@road-citizen-inspector/schemas'
import type { AuthorizationData } from '@road-citizen-inspector/contracts'
import type { AuthorizationError } from '@/data/api/authorization/AuthorizationError'
import { postAdministrativeAuthorization } from '@/data/api/authorization/PostAdministrativeAuthorization'

export function useAdministrativeAuthorization(
  options?: Partial<UseMutationOptions<
    AuthorizationData,
    AuthorizationError,
    AdministrativeAuthorizationSchema,
    AuthorizationData
  >>,
): UseMutationResult<
  AuthorizationData,
  AuthorizationError,
  AdministrativeAuthorizationSchema,
  AuthorizationData
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['authorization'],
    mutationFn: (params: AdministrativeAuthorizationSchema) =>
      postAdministrativeAuthorization(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['authorization']
      })
    },
    ...options,
  })
}

export default useAdministrativeAuthorization
