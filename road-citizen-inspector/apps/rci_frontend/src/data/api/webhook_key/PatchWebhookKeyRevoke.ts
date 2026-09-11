import { serverUrl } from "../ServerUrl"
import { AuthorizationError, PermissionError } from "../authorization/AuthorizationError"
import { ServerError } from "../ServerError"
import { WebhookKeyError } from "./WebhookKeyError"
import type { WebhookKeyContract, WebhookKeyData } from "@road-citizen-inspector/contracts"

const patchWebhookKeyRevoke = async (webhookKeyId: number): Promise<WebhookKeyData> => {
    const response = await fetch(`${serverUrl()}/webhook_key/revoke/${webhookKeyId}`, {
        method: 'PATCH',
        credentials: 'include'
    })

    if (!response.ok) {
        if (response.status === 401) {
            throw new AuthorizationError(
                'An active session must be present to access this resource'
            )
        } else if (response.status === 403) {
            throw new PermissionError(
                'This action could not be completed. This session does not have permission.'
            )
        } else {
            throw new ServerError(
                'An unknown error occurred revoking the webhook key. Please try again later.'
            )
        }
    }

    const {success, data} = (await response.json()) as WebhookKeyContract
    
    if (!success) {
        throw new WebhookKeyError(
            'Error occurred revoking the webhook key. Please try again later.'
        )
    }

    return data
}

export { patchWebhookKeyRevoke }