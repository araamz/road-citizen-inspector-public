import { AuthorizationError, PermissionError } from "../authorization/AuthorizationError"
import { ServerError } from "../ServerError"
import { serverUrl } from "../ServerUrl"
import { WebhookKeyError } from "./WebhookKeyError"
import type { SessionWebhookKeysContract } from "@road-citizen-inspector/contracts"

const GetSessionWebhookKeys = async () => {
    const response = await fetch(`${serverUrl()}/webhook_key`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })

    if (!response.ok) {
        if (response.status === 401) {
            throw new AuthorizationError(
                'An active session must be present to access this resource.',
            )
        } else if (response.status === 403) {
            throw new PermissionError(
                'Elevated permissions must be present to access this resource.',
            )
        } else {
            throw new ServerError(
                'An unexpected error occurred retrieving the session. Please try again later.',
            )
        }
    }

    const { success, data } = (await response.json()) as SessionWebhookKeysContract

    if (!success) {
        throw new WebhookKeyError(
            'Error occurred getting webhook keys. Webhook keys do not exist or are invalid.',
        )
    }

    return data;


}

export { GetSessionWebhookKeys }