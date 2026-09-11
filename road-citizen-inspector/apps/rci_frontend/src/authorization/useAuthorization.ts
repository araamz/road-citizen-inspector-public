import { useContext } from 'react'
import { AuthorizationContext } from './AuthorizationContext'

function useAuthorization() {
  const ctx = useContext(AuthorizationContext)

  if (!ctx) throw new Error("Authorization Context does not exist here.")

  return ctx
}

export default useAuthorization
