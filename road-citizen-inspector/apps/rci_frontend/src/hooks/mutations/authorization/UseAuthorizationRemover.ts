import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query'
import type { AuthorizationError } from '@/data/api/authorization/AuthorizationError'
import { deleteAuthorization } from '@/data/api/authorization/DeleteAuthorization'

export function useAuthorizationRemover(
  options?: Partial<UseMutationOptions<
    void,
    AuthorizationError,
    void,
    AuthorizationError
  >>,
): UseMutationResult<void, AuthorizationError, void, AuthorizationError> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['authorization', 'remove'],
    mutationFn: () => deleteAuthorization(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['authorization'],
        exact: true
      })
    },
    ...options,
  })
}

export default useAuthorizationRemover
