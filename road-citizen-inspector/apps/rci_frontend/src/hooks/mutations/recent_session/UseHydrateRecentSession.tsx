import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query'
import type { SessionData } from '@road-citizen-inspector/contracts'
import { hydrateRecentSession } from '@/data/indexed_db/recent_session/HydrateRecentSession'

export function useHydrateRecentSession(
    sessionId: number,
  options?: UseMutationOptions<number | null, Error, SessionData, number | null>,
): UseMutationResult<number| null, Error, SessionData, number | null> {
  return useMutation({
    mutationKey: ['recent_session', 'hydrate', sessionId],
    mutationFn: (session: SessionData) =>
      hydrateRecentSession(session.session_id, session),
    ...options,
  })
}

export default useHydrateRecentSession
