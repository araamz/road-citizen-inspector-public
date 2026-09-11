import { serverUrl } from '../ServerUrl'
import { SessionError } from './SessionError'
import type {
  SessionContract,
  SessionData,
} from '@road-citizen-inspector/contracts'

export const getSession = async (sessionId: number): Promise<SessionData> => {
  const response = await fetch(
    `${serverUrl()}/session/${sessionId}`,
  )

  if (!response.ok)
    throw new SessionError(
      'An unexpected error occurred retrieving the session. Please try again later.',
    )
  const { success, data } = (await response.json()) as SessionContract

  if (!success)
    throw new SessionError(
      'Error occurred getting session. Session does not exist or is invalid.',
    )
  return data
}
