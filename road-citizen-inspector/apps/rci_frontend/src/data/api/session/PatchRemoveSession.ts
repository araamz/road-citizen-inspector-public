import { AuthorizationError } from '../authorization/AuthorizationError'
import { serverUrl } from '../ServerUrl'
import { SessionError } from './SessionError'
import type {
  DeletedSessionContract,
  RemovedSessionData,
} from '@road-citizen-inspector/contracts'

const patchRemoveSession = async (): Promise<RemovedSessionData> => {
  const response = await fetch(`${serverUrl()}/session/remove`, {
    method: 'PATCH',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 403) {
      throw new AuthorizationError(
        'Session does not meet proper permissions to make changes.',
      )
    } else {
      throw new SessionError(
        'An unexpected error occurred deleting the session. Please try again later.',
      )
    }
  }
  const { success, data } = (await response.json()) as DeletedSessionContract
  if (!success)
    throw new Error(
      'An unexpected error occurred deleting session. Please try again.',
    )
  return data
}

export { patchRemoveSession }