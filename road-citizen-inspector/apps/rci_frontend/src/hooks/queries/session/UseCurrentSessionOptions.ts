import {  queryOptions } from '@tanstack/react-query'
import type {UseQueryOptions} from '@tanstack/react-query';
import type { SessionData } from '@road-citizen-inspector/contracts'
import type { SessionError } from '@/data/api/session/SessionError'
import { getCurrentSession } from '@/data/api/project/GetProject'

export function useCurrentSessionOptions(
  options?: UseQueryOptions<
    SessionData,
    SessionError,
    SessionData,
    [string, string]
  >,
) {

  return queryOptions({
    queryKey: ['user', 'session'],
    queryFn: async () => await getCurrentSession(),
    ...options,
  })
}

export default useCurrentSessionOptions
