import {  useMutation, useQueryClient } from "@tanstack/react-query";
import type {MutationOptions} from "@tanstack/react-query";
import type { AuthorizationError, PermissionError } from "@/data/api/authorization/AuthorizationError";
import type { ServerError } from "@/data/api/ServerError";
import type { WebhookKeyError } from "@/data/api/webhook_key/WebhookKeyError";
import type { WebhookKeyData } from "@road-citizen-inspector/contracts";
import { patchWebhookKeyRevoke } from "@/data/api/webhook_key/PatchWebhookKeyRevoke";

export default function useRevokeWebhookKey(
    options?: MutationOptions<
        WebhookKeyData,
        AuthorizationError | PermissionError | ServerError | WebhookKeyError,
        number,
        WebhookKeyData
    >
) {

    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (webhookKeyId: number) => patchWebhookKeyRevoke(webhookKeyId),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['webhook_key'] })
        },
        ...options
    })
}