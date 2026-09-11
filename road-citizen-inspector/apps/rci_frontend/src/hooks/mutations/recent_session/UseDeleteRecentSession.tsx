import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query'
import { deleteRecentSession } from '@/data/indexed_db/recent_session/DeleteRecentSession'

export function useDeleteRecentSession(
  sessionId: number,
  options?: UseMutationOptions<void, Error, void, Promise<void>>,
): UseMutationResult<void, Error, void, Promise<void>> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['recent_session', 'deleted', sessionId],
    mutationFn: async () => await deleteRecentSession(sessionId),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ['recent_session', sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['recent_session'],
        exact: true,
      })
    },
    ...options,
  })
}

export default useDeleteRecentSession
