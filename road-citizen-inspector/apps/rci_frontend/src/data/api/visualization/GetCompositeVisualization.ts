import { AuthorizationError, PermissionError } from "../authorization/AuthorizationError";
import { ServerError } from "../ServerError";
import { serverUrl } from "../ServerUrl";
import { VisualizationError } from "./VisualizationError";
import type { CompositeVisualizationQuerySchema } from "@road-citizen-inspector/schemas";
import type { CompositeVisualizationContract } from "@road-citizen-inspector/contracts";
import type { CompositeVisualizationData } from "@road-citizen-inspector/visualization";

export default async function getCompositeVisualization(queryParams: CompositeVisualizationQuerySchema): Promise<CompositeVisualizationData> {

    const queryUrl = new URLSearchParams()

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value === null || (Array.isArray(value) && value.length === 0)) return;

        if (Array.isArray(value)) {
            value.forEach(item => queryUrl.append(key, String(item)));
        } else {
            queryUrl.set(key, String(value));
        }
    });

    const response = await fetch(`${serverUrl()}/visualization/project/composite?${queryUrl.toString()}`, {
        credentials: 'include'
    })

    if (!response.ok) {
        if (response.status === 401) throw new AuthorizationError('An active session must be present to access this resource.');
        else if (response.status === 403) throw new PermissionError('Elevated permissions must be present to access this resource.');
        else throw new ServerError('An unexpected error occurred retrieving the visualization. Please try again later.');
    }

    const { success, data } = await (response.json()) as CompositeVisualizationContract;

    if (!success) throw new VisualizationError('Error occurred getting composite visualization. Visualization does not exist or is invalid.');

    return data;
}