import {  queryOptions } from "@tanstack/react-query";
import type {UseSuspenseQueryOptions} from "@tanstack/react-query";
import type { AuthorizationError } from "@/data/api/authorization/AuthorizationError";
import type { WebhookKeyError } from "@/data/api/webhook_key/WebhookKeyError";
import type { LatestWebhookKeyData } from "@road-citizen-inspector/contracts";
import { getLatestWebhookKey } from "@/data/api/webhook_key/GetLatestWebhookKey";

export function useLatestWebhookKeySuspenseOptions(
    options?: UseSuspenseQueryOptions<
        LatestWebhookKeyData,
        WebhookKeyError | AuthorizationError,
        LatestWebhookKeyData,
        [string, string, string]
    >
) {
    return queryOptions({
        queryKey: ['user', 'webhook_key', 'latest'],
        queryFn: async () => await getLatestWebhookKey(),
        ...options
    })
}

export default useLatestWebhookKeySuspenseOptions