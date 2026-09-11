import { queryRecentSession } from '@/data/indexed_db/recent_session/QueryRecentSession'
import { type RecentSession } from '@/integrations/dexie/RecentSessions.db'
import {
  queryOptions,
  type UseSuspenseQueryOptions,
} from '@tanstack/react-query'

function useRecentSession(
  sessionId: number,
  options?: Partial<UseSuspenseQueryOptions<
    RecentSession | undefined,
    Error,
    RecentSession | undefined,
    [string, number]
  >>,
) {
  return queryOptions({
    queryKey: ['recent_session', sessionId],
    queryFn: async (q) => queryRecentSession(q.queryKey[1]),
    ...options,
  })
}

export default useRecentSession
