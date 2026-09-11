import { serverUrl } from "../ServerUrl"
import { AuthorizationError, PermissionError } from "../authorization/AuthorizationError"
import { ServerError } from "../ServerError"
import { ReadingError } from "./ReadingError"
import type { PagiantedReadingData, ReadingPaginationContract } from "@road-citizen-inspector/contracts"
import type { ReadingQuerySchema } from "@road-citizen-inspector/schemas"

const getPaginatedReadings = async (queryParams: ReadingQuerySchema): Promise<PagiantedReadingData> => {

    const queryUrl = new URLSearchParams()

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value === null || (Array.isArray(value) && value.length === 0)) return;

        if (Array.isArray(value)) {
            value.forEach(item => queryUrl.append(key, String(item)));
        } else {
            queryUrl.set(key, String(value));
        }
    });

    const response = await fetch(`${serverUrl()}/reading/paginated?${queryUrl.toString()}`, {
        method: "GET",
        credentials: "include"
    })

    if (!response.ok) {
        if (response.status === 401) throw new AuthorizationError('An active session must be present to access this resource.')
        else if (response.status === 403) throw new PermissionError('Elevated permissions must be present to access this resource.')
        else if (response.status === 500) throw new ServerError('An unexpected error occurred retrieving the readings. Please try again later.')
    }

    const { success, data } = (await response.json()) as ReadingPaginationContract

    if (!success) throw new ReadingError('Error occurred getting readings. Readings do not exist or are invalid.')

    return data
}

export default getPaginatedReadings