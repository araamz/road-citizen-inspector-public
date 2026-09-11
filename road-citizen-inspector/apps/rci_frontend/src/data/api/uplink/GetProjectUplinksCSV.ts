import { serverUrl } from "../ServerUrl";
import { AuthorizationError, PermissionError } from "../authorization/AuthorizationError";
import { ServerError } from "../ServerError";
import type { UplinkQuerySchema } from "@road-citizen-inspector/schemas";

export default async function getProjectUplinksCSV(queryParams?: UplinkQuerySchema) {

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

    const response = await fetch(`${serverUrl()}/uplink/project/file?${queryParams ? queryUrl.toString() : undefined}`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        if (response.status === 401) throw new AuthorizationError("An active session must be present to access this resource.");
        else if (response.status === 403) throw new PermissionError("Elevated permissions must be present to access this resource.");
        else throw new ServerError("An unexpected error occurred retrieving the uplinks data for CSV file. Please try again later.");
    }

    const uplinksFileName = () => {
        if (queryParams?.created_at_start && queryParams?.created_at_end) {
            return `uplinks_${queryParams.created_at_start}_${queryParams.created_at_end}.csv`
        } else if (queryParams?.created_at_start) {
            return `uplinks_${queryParams.created_at_start}.csv`
        } else if (queryParams?.created_at_end) {
            return `uplinks_${queryParams.created_at_end}.csv`
        } else {
            return "uplinks.csv"
        }
    }

    // NOTE: Used form here https://gist.github.com/javilobo8/097c30a233786be52070986d8cdb1743.
    const csvBlob = await response.blob()
    const url = window.URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uplinksFileName());
    document.body.appendChild(link);
    link.click();
    link.remove();

}