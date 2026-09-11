import {
  
  
  useMutation
} from '@tanstack/react-query'
import type {UseMutationOptions, UseMutationResult} from '@tanstack/react-query';
import type { SessionData } from '@road-citizen-inspector/contracts'
import { addNewRecentSession } from '@/data/indexed_db/recent_session/AddNewRecentSession'

export function useNewRecentSession(
  options?: UseMutationOptions<number, Error, SessionData, number>,
): UseMutationResult<number, Error, SessionData, number> {
  return useMutation({
    mutationKey: ['recent_session', 'new'],
    mutationFn: (session: SessionData) =>
      addNewRecentSession(session.session_id, session),
    ...options,
  })
}

export default useNewRecentSession
