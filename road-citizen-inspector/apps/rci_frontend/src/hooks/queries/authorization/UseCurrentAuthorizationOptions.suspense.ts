import {
  
  queryOptions
} from '@tanstack/react-query'
import type {UseSuspenseQueryOptions} from '@tanstack/react-query';
import type { AuthorizationData } from '@road-citizen-inspector/contracts'
import type { AuthorizationError } from '@/data/api/authorization/AuthorizationError'
import { getAuthorization } from '@/data/api/authorization/GetAuthorization'

export function useCurrentAuthorizationSuspenseOptions(
  options?: Partial<UseSuspenseQueryOptions<
    AuthorizationData,
    AuthorizationError,
    AuthorizationData,
    [string, string]
  >>,
): UseSuspenseQueryOptions<
  AuthorizationData,
  AuthorizationError,
  AuthorizationData,
  [string, string]
> {
  return queryOptions({
    queryKey: ['user', 'authorization'],
    queryFn: () => getAuthorization(),
    ...options
  })
}

export default useCurrentAuthorizationSuspenseOptions
