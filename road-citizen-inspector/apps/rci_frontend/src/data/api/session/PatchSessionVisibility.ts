import { AuthorizationError } from '../authorization/AuthorizationError'
import { serverUrl } from '../ServerUrl'
import { SessionError } from './SessionError'
import type {
  SessionContract,
  SessionData,
} from '@road-citizen-inspector/contracts'
import type {
  UpdatedSessionVisibilitySchema,
} from '@road-citizen-inspector/schemas/session'

const patchSessionVisibility = async ({
  visibility,
  password,
}: UpdatedSessionVisibilitySchema): Promise<SessionData> => {
  const response = await fetch(`${serverUrl()}/session/visibility`, {
    method: 'PATCH',
    body: JSON.stringify({
      visibility,
      password,
    }),
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 403) {
      throw new AuthorizationError(
        'Session does not meet proper permissions to make changes.',
      )
    } else {
      throw new SessionError(
        'An unexpected error occurred updating the session. Please try again later.',
      )
    }
  }
  const { success, data } = (await response.json()) as SessionContract
  if (!success)
    throw new Error(
      'An unexpected error occurred updating session. Please try again.',
    )
  return data
}

export { patchSessionVisibility }
