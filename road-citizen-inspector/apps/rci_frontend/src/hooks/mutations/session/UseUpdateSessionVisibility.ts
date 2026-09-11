import {  useMutation, useQueryClient } from "@tanstack/react-query";
import useUpdateRecentSession from "../recent_session/UseUpdateRecentSession";
import type {UseMutationOptions} from "@tanstack/react-query";
import type { AuthorizationError } from "@/data/api/authorization/AuthorizationError";
import type { SessionError } from "@/data/api/session/SessionError";
import type { SessionData } from "@road-citizen-inspector/contracts";
import type { UpdatedSessionVisibilitySchema } from "@road-citizen-inspector/schemas";
import { patchSessionVisibility } from "@/data/api/session/PatchSessionVisibility";


export function useUpdateSessionVisibility(
    sessionId: number,
    options?: UseMutationOptions<
        SessionData,
        AuthorizationError | SessionError,
        UpdatedSessionVisibilitySchema,
        SessionData
    >
) {

    const queryClient = useQueryClient()
    const {mutate} = useUpdateRecentSession(sessionId)

    return useMutation({
        mutationKey: ['user', 'update', 'session', 'visibility'],
        mutationFn: (params: UpdatedSessionVisibilitySchema) => patchSessionVisibility(params),
        onSuccess: (data) => {
            mutate({
                session: data
            })
            queryClient.invalidateQueries({
                queryKey: ['authorization']
            })
        },
        ...options
    })

}