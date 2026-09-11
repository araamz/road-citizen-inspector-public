import {  useCallback, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionStore } from '../hooks/stores/UseSessionStore'
import { AuthorizationContext } from './AuthorizationContext'
import type {ReactNode} from 'react';
import { getAuthorization } from '@/data/api/authorization/GetAuthorization'
import useAuthorizationRemover from '@/hooks/mutations/authorization/UseAuthorizationRemover'
import usePrivateAuthorization from '@/hooks/mutations/authorization/UsePrivateAuthorization'
import usePublicAuthorization from '@/hooks/mutations/authorization/UsePublicAuthorization'
import useAdministrativeAuthorization from '@/hooks/mutations/authorization/UseAdministrativeAuthorization'
import useCurrentAuthorizationOptions from '@/hooks/queries/authorization/UseCurrentAuthorizationOptions';

type ParentContainer = {
  children: ReactNode
}

const AuthorizationProvider = ({ children }: ParentContainer) => {
  const session = useSessionStore((state) => state.session)
  const role = useSessionStore((state) => state.role)
  const clearSessionStore = useSessionStore((state) => state.clearSession)
  const setSessionStore = useSessionStore((state) => state.setSession)
  const queryClient = useQueryClient()

  const removeAuthorization = useAuthorizationRemover({
    onSuccess: () => {
      clearSessionStore()
      queryClient.removeQueries({
        queryKey: ['user']
      })
    },
  })
  const requestPrivateAuthorization = usePrivateAuthorization({
    onSuccess: ({ role, session }) => {
      setSessionStore(role, session)
    },
  })
  const requestPublicAuthorization = usePublicAuthorization({
    onSuccess: ({ role, session }) => {
      setSessionStore(role, session)
    },
  })
  const requestAdministrativeAuthorization = useAdministrativeAuthorization({
    onSuccess: ({ role, session }) => {
      setSessionStore(role, session)
    },
  })

  const { data, error } = useQuery(
    useCurrentAuthorizationOptions({
      retry: 1,
    }),
  )

  const verifyAuthorization = useCallback(
    async (abortController?: AbortController) => {
      return getAuthorization(abortController)
    },
    [getAuthorization],
  )

  useEffect(() => {
    if (data) {
      setSessionStore(data.role, data.session)
    }
  }, [setSessionStore, data])

  useEffect(() => {
    if (error) clearSessionStore()
  }, [error, clearSessionStore])

  const ctx = useMemo<AuthorizationContext>(
    () => ({
      role,
      session,
      verifyAuthorization,
      removeAuthorization,
      requestPrivateAuthorization,
      requestPublicAuthorization,
      requestAdministrativeAuthorization,
    }),
    [
      session,
      role,
      verifyAuthorization,
      removeAuthorization,
      requestPrivateAuthorization,
      requestPublicAuthorization,
      requestAdministrativeAuthorization,
    ],
  )

  return (
    <AuthorizationContext.Provider value={ctx}>
      {children}
    </AuthorizationContext.Provider>
  )
}

export { AuthorizationProvider }
