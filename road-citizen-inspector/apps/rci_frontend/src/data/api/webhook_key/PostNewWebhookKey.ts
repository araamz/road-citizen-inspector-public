import { AuthorizationError, PermissionError } from "../authorization/AuthorizationError";
import { ServerError } from "../ServerError";
import { serverUrl } from "../ServerUrl";
import { WebhookKeyError } from "./WebhookKeyError";
import type { WebhookKeyContract } from "@road-citizen-inspector/contracts";

export default async function postNewWebhookKey() {
    const response = await fetch(`${serverUrl()}/webhook_key`, {
        method: 'POST',
        credentials: 'include',
    })

    if (!response.ok) {
        if (response.status === 401) {
            throw new AuthorizationError('An active session must be present to access this resource.');
        } else if (response.status === 403) {
            throw new PermissionError('Elevated permissions must be present to access this resource.');
        } else {
            throw new ServerError('An unexpected error occurred creating the webhook key. Please try again later.');
        }
    }

    const { success, data } = (await response.json()) as WebhookKeyContract;

    if (!success) {
        throw new WebhookKeyError(
            'Error occurred creating webhook key. Webhook key was not created or is invalid.',
        );
    }

    return data;
}