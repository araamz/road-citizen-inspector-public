import { serverUrl } from "../ServerUrl";
import { AuthorizationError, PermissionError } from "../authorization/AuthorizationError";
import { ServerError } from "../ServerError";
import { StatusError } from "./StatusError";
import type { StatusQuerySchema } from "@road-citizen-inspector/schemas";
import type { PaginatedStatusContract } from "@road-citizen-inspector/contracts";

export default async function getPaginatedStatus(queryParams: StatusQuerySchema) {

    const queryUrl = new URLSearchParams()

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value === null || (Array.isArray(value) && value.length === 0)) return;

        if (Array.isArray(value)) {
            value.forEach(item => queryUrl.append(key, String(item)));
        } else {
            queryUrl.set(key, String(value));
        }
    });
    
    const response = await fetch(`${serverUrl()}/status/paginated?${queryUrl.toString()}`, {
        method: "GET",
        credentials: 'include'
    })

    if (!response.ok) {
        if (response.status === 401) throw new AuthorizationError("An active session must be present to access this resource.");
        else if (response.status === 403) throw new PermissionError("Elevated permissions must be present to access this resource.");
        else throw new ServerError("An unexpected error occurred retrieving the status data. Please try again later.");
    }

    const { success, data } = await (response.json()) as PaginatedStatusContract;

    if (!success) throw new StatusError("Error occurred getting status data. Status data do not exist or are invalid.");

    return data;
}
