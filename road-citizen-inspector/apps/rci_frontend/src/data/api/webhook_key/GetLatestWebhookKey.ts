import type { LatestWebhookKeyContract, LatestWebhookKeyData } from "@road-citizen-inspector/contracts"
import { serverUrl } from "../ServerUrl"
import { AuthorizationError, PermissionError } from "../authorization/AuthorizationError"
import { WebhookKeyError } from "./WebhookKeyError"
import { ServerError } from "../ServerError"

const getLatestWebhookKey = async (): Promise<LatestWebhookKeyData> => {
    const response = await fetch(`${serverUrl()}/webhook_key/latest`, {
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
                'An unknown error occurred retrieving the latest webhook key. Please try again later.'
            )
        }
    }

    const {success, data} = (await response.json()) as LatestWebhookKeyContract
    
    if (!success) {
        throw new WebhookKeyError(
            'Error occurred getting latest webhook key. Please try again later.'
        )
    }

    return data
}

export { getLatestWebhookKey }