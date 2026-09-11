import {
  useMutation
} from '@tanstack/react-query'
import useNewRecentSession from '../recent_session/UseNewRecentSession'
import type {UseMutationOptions, UseMutationResult} from '@tanstack/react-query';
import type { NewSessionSchema } from '@road-citizen-inspector/schemas'
import type { SessionGenerationProvisionData } from '@road-citizen-inspector/contracts'
import type { SessionError } from '@/data/api/session/SessionError'
import { postSession } from '@/data/api/session/PostSession'

export function useNewSession(
  options?: UseMutationOptions<
    SessionGenerationProvisionData,
    SessionError,
    NewSessionSchema,
    SessionGenerationProvisionData
  >,
): UseMutationResult<
  SessionGenerationProvisionData,
  SessionError,
  NewSessionSchema,
  SessionGenerationProvisionData
> {

  const { mutate } = useNewRecentSession()

  return useMutation({

    mutationKey: ['new_session'],
    mutationFn: (params: NewSessionSchema) => postSession(params),
    onSuccess: (data) => {
      mutate(data.session)
    },
    ...options,
  })
}

export default useNewSession
