import type { SessionContract, SessionData } from '@road-citizen-inspector/contracts'
import { AuthorizationError } from '../authorization/AuthorizationError'
import { SessionError } from '../session/SessionError'
import { serverUrl } from '../ServerUrl'

const getCurrentSession = async (): Promise<SessionData> => {
  const response = await fetch(`${serverUrl()}/session`, {
    credentials: 'include'
  })
  if (!response.ok) {
    if (response.status === 401) {
      throw new AuthorizationError(
        'An active session must be present to access this resource.',
      )
    } else {
      throw new SessionError(
        'An unexpected error occurred retrieving the session. Please try again later.',
      )
    }
  }
  const { success, data } = (await response.json()) as SessionContract

  if (!success)
    throw new SessionError(
      'Error occurred getting session. Session does not exist or is invalid.',
    )
  return data
}

export { getCurrentSession }