import { queryOptions } from "@tanstack/react-query";
import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import type { AuthorizationError, PermissionError } from "@/data/api/authorization/AuthorizationError";
import type { ServerError } from "@/data/api/ServerError";
import type { WebhookKeyError } from "@/data/api/webhook_key/WebhookKeyError";
import type { WebhookKeyData } from "@road-citizen-inspector/contracts";
import { GetSessionWebhookKeys } from "@/data/api/webhook_key/GetSessionWebhookKeys";

export default function UseSessionWebhookKeysSuspenseOptions(options?:
    Partial<UseSuspenseQueryOptions<
        Array<WebhookKeyData>,
        AuthorizationError | PermissionError | ServerError | WebhookKeyError,
        Array<WebhookKeyData>,
        [string, string]>
    >) {
    return queryOptions({
        queryKey: ['user', 'webhook_key'],
        queryFn: async () => GetSessionWebhookKeys(),
        ...options
    })
}