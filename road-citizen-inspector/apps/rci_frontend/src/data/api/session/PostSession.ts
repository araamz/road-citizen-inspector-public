import { serverUrl } from '../ServerUrl'
import { SessionError } from './SessionError'
import type {
  SessionGenerationProvisionContract,
  SessionGenerationProvisionData,
} from '@road-citizen-inspector/contracts'
import type { NewSessionSchema } from '@road-citizen-inspector/schemas'

const postSession = async ({
  title,
  description,
  visibility,
  password,
  administrative_password,
}: NewSessionSchema): Promise<SessionGenerationProvisionData> => {
  const response = await fetch(`${serverUrl()}/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      description,
      password,
      visibility,
      administrative_password,
    }),
  })

  if (!response.ok) {
    if (response.status === 400)
      throw new SessionError(
        'Error occurred when creating a new session. The request is invalid.',
      )
    else
      throw new SessionError(
        'Error occurred when creating a new session. Please try again later.',
      )
  }
  const { success, data } =
    (await response.json()) as SessionGenerationProvisionContract
  if (!success)
    throw new SessionError(
      'Error occurred when creating a new session. Please try again later.',
    )
  return data
}

export { postSession }