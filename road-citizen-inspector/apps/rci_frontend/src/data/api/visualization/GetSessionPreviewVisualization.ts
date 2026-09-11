import type { CompositeVisualizationQuery, SessionPreviewData } from "@road-citizen-inspector/visualization";
import { serverUrl } from "../ServerUrl";
import { AuthorizationError, PermissionError } from "../authorization/AuthorizationError";
import { VisualizationError } from "./VisualizationError";
import { ServerError } from "../ServerError";
import type { ContractError, SessionPreviewContract } from "@road-citizen-inspector/contracts";

export default async function getSessionPreviewVisualization(sessionId: number, queryParams: CompositeVisualizationQuery): Promise<SessionPreviewData> {
    const queryUrl = new URLSearchParams()

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value === null || (Array.isArray(value) && value.length === 0)) return;

        if (Array.isArray(value)) {
            value.forEach(item => queryUrl.append(key, String(item)));
        } else {
            queryUrl.set(key, String(value));
        }
    });

    const response = await fetch(`${serverUrl()}/visualization/session/${sessionId}/preview?${queryUrl.toString()}`)

    if (!response.ok) {
        if (response.status === 401) throw new AuthorizationError('An active session must be present to access this resource.');
        else if (response.status === 403) throw new PermissionError('Elevated permissions must be present to access this resource.');
        else {
            const errorBody = (await response.json()) as ContractError
            if (errorBody.error.name === "session_not_claimed_error".toUpperCase()) throw new VisualizationError("Session is not claimed.")
            throw new ServerError("An unknown error occurred generating session preview.")
        }
    }

    const { success, data } = await (response.json()) as SessionPreviewContract

    if (!success) throw new VisualizationError('Error occurred getting session preview for session.')

    return data;

}