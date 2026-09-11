import { AuthorizationError } from '../authorization/AuthorizationError'
import { serverUrl } from '../ServerUrl'
import { SessionError } from './SessionError'
import type { SessionContract, SessionData } from '@road-citizen-inspector/contracts'

const getCurrentSession = async (): Promise<SessionData> => {
  const response = await fetch(`${serverUrl()}/session`)
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