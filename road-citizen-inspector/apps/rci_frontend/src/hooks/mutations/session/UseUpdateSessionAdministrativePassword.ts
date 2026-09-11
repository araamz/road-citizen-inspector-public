import {  useMutation, useQueryClient } from "@tanstack/react-query"
import type {UseMutationOptions} from "@tanstack/react-query";
import type { AuthorizationError } from "@/data/api/authorization/AuthorizationError"
import type { SessionError } from "@/data/api/session/SessionError"
import type { SessionData } from "@road-citizen-inspector/contracts"
import type { UpdatedSessionAdministrativePasswordSchema } from "@road-citizen-inspector/schemas"
import { patchSessionAdministrativePassword } from "@/data/api/session/PatchSessionAdministrativePassword";

export function useUpdateSessionAdministrativePassword(
    options?: UseMutationOptions<
        SessionData,
        AuthorizationError | SessionError,
        UpdatedSessionAdministrativePasswordSchema,
        SessionData
    >
) {

    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['user', 'update', 'session', 'administrative_password'],
        mutationFn: (params: UpdatedSessionAdministrativePasswordSchema) => patchSessionAdministrativePassword(params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['authorization']
            })
        },
        ...options
    })

}