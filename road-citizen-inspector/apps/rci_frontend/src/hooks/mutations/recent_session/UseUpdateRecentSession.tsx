import {
  
  
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import type {UseMutationOptions, UseMutationResult} from '@tanstack/react-query';
import type { RecentSession } from '@/integrations/dexie/RecentSessions.db'
import { updateRecentSession } from '@/data/indexed_db/recent_session/UpdateRecentSession'

export function useUpdateRecentSession(
  sessionId: number,
  options?: UseMutationOptions<number, Error, Partial<RecentSession>, number>,
): UseMutationResult<number, Error, Partial<RecentSession>, number> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['recent_session', 'update', sessionId],
    mutationFn: async (session: Partial<RecentSession>) =>
      await updateRecentSession(sessionId, session),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['recent_session', sessionId],
      })
    },
    ...options,
  })
}

export default useUpdateRecentSession
