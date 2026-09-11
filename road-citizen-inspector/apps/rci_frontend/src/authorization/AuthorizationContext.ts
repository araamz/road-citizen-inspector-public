import { createContext } from 'react'
import type { SessionRole } from '../hooks/stores/UseSessionStore'
import type {
  AuthorizationData,
  SessionData,
} from '@road-citizen-inspector/contracts'
import type { UseMutationResult } from '@tanstack/react-query'
import type { AuthorizationError } from '@/data/api/authorization/AuthorizationError'
import type { AdministrativeAuthorizationSchema, PrivateAuthorizationSchema, PublicAuthorizationSchema } from '@road-citizen-inspector/schemas'

export interface AuthorizationContext {
  session: SessionData | null
  role: SessionRole | null
  verifyAuthorization: (
    abortController?: AbortController,
  ) => Promise<AuthorizationData>
  removeAuthorization: UseMutationResult<
    void,
    AuthorizationError,
    void,
    AuthorizationError
  >
  requestPrivateAuthorization: UseMutationResult<
    AuthorizationData,
    AuthorizationError,
    PrivateAuthorizationSchema,
    AuthorizationError
  >
  requestPublicAuthorization: UseMutationResult<
    AuthorizationData,
    AuthorizationError,
    PublicAuthorizationSchema,
    AuthorizationError
  >
  requestAdministrativeAuthorization: UseMutationResult<
    AuthorizationData,
    AuthorizationError,
    AdministrativeAuthorizationSchema,
    AuthorizationData
  >
}

export const AuthorizationContext = createContext<AuthorizationContext | null>(
  null,
)
