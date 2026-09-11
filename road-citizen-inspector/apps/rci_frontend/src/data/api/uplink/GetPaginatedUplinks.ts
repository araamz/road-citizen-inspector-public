import { serverUrl } from "../ServerUrl";
import { AuthorizationError, PermissionError } from "../authorization/AuthorizationError";
import { ServerError } from "../ServerError";
import { UplinkError } from "./UplinkError";
import type { UplinkQuerySchema } from "@road-citizen-inspector/schemas"
import type { PaginatedUplinkData, UplinkPaginationContract } from "@road-citizen-inspector/contracts";

export default async function GetPaginatedUplinks(queryParams: UplinkQuerySchema): Promise<PaginatedUplinkData> {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
        if (
            value === null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0)
        ) {
            return;
        }
        if (Array.isArray(value)) {
            value.forEach(item => params.append(key, String(item)));
        } else {
            params.set(key, String(value));
        }
    });

    const response = await fetch(`${serverUrl()}/uplink/paginated?${params.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    });

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
                'An unexpected error occurred retrieving the uplinks. Please try again later.',
            )
        }
    }

    const { success, data } = (await response.json()) as UplinkPaginationContract

    if (!success) {
        throw new UplinkError(
            'Error occurred getting uplinks. Uplinks do not exist or are invalid.',
        )
    }

    return data;

}