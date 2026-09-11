import type {
  AuthorizationContract,
  AuthorizationData,
} from '@road-citizen-inspector/contracts'
import { AuthorizationError } from './AuthorizationError'
import { serverUrl } from '../ServerUrl'

const getAuthorization = async (
  abortController?: AbortController,
): Promise<AuthorizationData> => {
  const response = await fetch(
    `${serverUrl()}/authorization`,
    {
      method: 'GET',
      credentials: 'include',
      signal: abortController ? abortController.signal : null
    },
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new AuthorizationError(
        'Session does not meet proper permissions to make changes.',
      )
    } else {
      throw new AuthorizationError(
        'An unexpected error occurred updating the session. Please try again later.',
      )
    }
  }
  const { success, data } = (await response.json()) as AuthorizationContract
  if (!success)
    throw new Error(
      'An unexpected error occurred updating session. Please try again.',
    )
  return data
}

export { getAuthorization }
