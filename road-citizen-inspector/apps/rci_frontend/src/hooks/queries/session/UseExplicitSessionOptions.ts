import { queryOptions, type UseQueryOptions } from '@tanstack/react-query'
import type { SessionData } from '@road-citizen-inspector/contracts'
import { getSession } from '@/data/api/session/GetSession'
import type { SessionError } from '@/data/api/session/SessionError'

export function useExplicitSessionOptions(
  sessionId: number,
  options?: UseQueryOptions<
    SessionData,
    SessionError,
    SessionData,
    [string, number]
  >,
) {
  return queryOptions({
    queryKey: ['session', sessionId],
    queryFn: async (q) => await getSession(q.queryKey[1]),
    ...options,
  })
}

export default useExplicitSessionOptions
