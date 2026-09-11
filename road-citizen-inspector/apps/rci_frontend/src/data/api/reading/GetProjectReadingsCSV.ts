import { serverUrl } from "../ServerUrl";
import { AuthorizationError, PermissionError } from "../authorization/AuthorizationError";
import { ServerError } from "../ServerError";
import type { ReadingQuerySchema } from "@road-citizen-inspector/schemas";

export default async function getProjectReadingsCSV(queryParams?: ReadingQuerySchema) {

    const queryUrl = new URLSearchParams()

    if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value === null || (Array.isArray(value) && value.length === 0)) return;

            if (Array.isArray(value)) {
                value.forEach(item => queryUrl.append(key, String(item)));
            } else {
                queryUrl.set(key, String(value));
            }
        });

    }

    const response = await fetch(`${serverUrl()}/reading/project/file?${queryParams ? queryUrl.toString() : undefined}`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        if (response.status === 401) throw new AuthorizationError("An active session must be present to access this resource.");
        else if (response.status === 403) throw new PermissionError("Elevated permissions must be present to access this resource.");
        else throw new ServerError("An unexpected error occurred retrieving the reading data for CSV file. Please try again later.");
    }

    console.log("queryParams", queryParams)
    const readingsFileName = () => {
        if (queryParams?.vehicle_detection_time_start && queryParams?.vehicle_detection_time_end) {
            return `readings_${queryParams.vehicle_detection_time_start}_${queryParams.vehicle_detection_time_end}.csv`
        } else if (queryParams?.vehicle_detection_time_start) {
            return `readings_${queryParams.vehicle_detection_time_start}.csv`
        } else if (queryParams?.vehicle_detection_time_end) {
            return `readings_${queryParams.vehicle_detection_time_end}.csv`
        } else {
            return "readings.csv"
        }
    }

    // NOTE: Used form here https://gist.github.com/javilobo8/097c30a233786be52070986d8cdb1743.
    const csvBlob = await response.blob()
    const url = window.URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', readingsFileName());
    document.body.appendChild(link);
    link.click();
    link.remove();

}