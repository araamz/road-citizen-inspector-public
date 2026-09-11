import type {
  AuthorizationContract,
  AuthorizationData,
  ContractError,
} from '@road-citizen-inspector/contracts'
import type { AdministrativeAuthorizationSchema } from '@road-citizen-inspector/schemas'
import { AuthorizationError } from './AuthorizationError'
import { serverUrl } from '../ServerUrl'

const postAdministrativeAuthorization = async ({
  cred_session_id,
  cred_administrative_password,
}: AdministrativeAuthorizationSchema): Promise<AuthorizationData> => {
  const response = await fetch(
    `${serverUrl()}/authorization/administrative`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cred_session_id,
        cred_administrative_password,
      }),
      credentials: 'include',
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
    } else if (error.name === 'SESSION_CREDENTIAL_ERROR') {
      throw new AuthorizationError(
        'Error occurred when accessing the session. Please make sure the session exists and your credentials are valid.',
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

export { postAdministrativeAuthorization }
