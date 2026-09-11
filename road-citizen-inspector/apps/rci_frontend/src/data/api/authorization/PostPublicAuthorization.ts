import type {
  AuthorizationContract,
  AuthorizationData,
  ContractError,
} from '@road-citizen-inspector/contracts'
import type { PublicAuthorizationSchema } from '@road-citizen-inspector/schemas'
import { AuthorizationError } from './AuthorizationError'
import { serverUrl } from '../ServerUrl'

const postPublicAuthorization = async ({
  cred_session_id,
}: PublicAuthorizationSchema): Promise<AuthorizationData> => {
  const response = await fetch(
    `${serverUrl()}/authorization/public`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cred_session_id,
      }),
      credentials: "include"
    },
  )
  if (!response.ok)
    throw new AuthorizationError(
      'Error occurred when accessing the session session. Please try again.',
    )
  const { success, data, error } =
    (await response.json()) as AuthorizationContract & ContractError<{
      name: string;
      message?: string;
    }>
  if (!success && error) {
    if (error.name === 'SESSION_VERIFICATION_ERROR') {
      throw new AuthorizationError(
        'Error occurred when accessing the session. Please make sure the session exists and is valid.',
      )
    } else {
      throw new AuthorizationError(
        'An unexpected error occurred when accessing the session. Please try again later.',
      )
    }
  } else if (!success) {
    throw new AuthorizationError(
      'An unexpected error occurred when accessing the session. Please try again later.',
    )
  } else return data
}

export { postPublicAuthorization }
