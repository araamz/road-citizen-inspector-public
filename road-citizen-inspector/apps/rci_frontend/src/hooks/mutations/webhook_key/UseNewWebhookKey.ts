import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MutationOptions } from "@tanstack/react-query";
import type { AuthorizationError, PermissionError } from "@/data/api/authorization/AuthorizationError";
import type { ServerError } from "@/data/api/ServerError";
import type { WebhookKeyError } from "@/data/api/webhook_key/WebhookKeyError";
import type { WebhookKeyData } from "@road-citizen-inspector/contracts";
import postNewWebhookKey from "@/data/api/webhook_key/PostNewWebhookKey";

export default function useNewWebhookKey(
    options?: MutationOptions<
        WebhookKeyData,
        AuthorizationError | PermissionError | ServerError | WebhookKeyError,
        void,
        WebhookKeyData
    >
) {

    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => postNewWebhookKey(),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['webhook_key'] })
        },
        ...options
    })
}