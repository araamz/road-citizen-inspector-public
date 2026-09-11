import {
  
  queryOptions
} from '@tanstack/react-query'
import type {UseQueryOptions} from '@tanstack/react-query';
import type { AuthorizationData } from '@road-citizen-inspector/contracts'
import type { AuthorizationError } from '@/data/api/authorization/AuthorizationError'
import { getAuthorization } from '@/data/api/authorization/GetAuthorization'

export function useCurrentAuthorizationOptions(
  options?: Partial<UseQueryOptions<
    AuthorizationData,
    AuthorizationError,
    AuthorizationData,
    [string, string]
  >>,
): UseQueryOptions<
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

export default useCurrentAuthorizationOptions
