import type { Contract } from '@road-citizen-inspector/contracts'
import { AuthorizationError } from './AuthorizationError'
import { serverUrl } from '../ServerUrl'

const postDeleteAuthorization = async (): Promise<void> => {
  const response = await fetch(
    `${serverUrl()}/authorization`,
    {
      method: 'DELETE',
      credentials: 'include'
    },
  )
  if (!response.ok)
    throw new AuthorizationError(
      'An unexpected error occurred ending the session. Please try again later.',
    )
  const { success } = (await response.json()) as Contract
  if (!success)
    throw new AuthorizationError(
      'An unexpected error occurred ending the session. Please try again.',
    )
  return
}

export { postDeleteAuthorization }
