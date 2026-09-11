import type { ContractError } from '@road-citizen-inspector/contracts'
import { AuthorizationError } from './AuthorizationError'
import { serverUrl } from '../ServerUrl'

const deleteAuthorization = async (): Promise<void> => {
  const response = await fetch(
    `${serverUrl()}/authorization`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) throw new Error("Error occurred when leaving session.")
  const { success } = (await response.json()) as ContractError
  if (!success)
    throw new AuthorizationError('Error occurred when leaving session. Please try again.')
  return
}

export { deleteAuthorization }