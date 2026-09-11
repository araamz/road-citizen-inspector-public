import type { Device, PaginationResult, Reading, Status, Uplink } from "@road-citizen-inspector/models";
import type { CompositeVisualizationData, DevicePreviewVisualizationData, DeviceVisualizationData, SessionPreviewData } from "@road-citizen-inspector/visualization";
import type { Contract } from "./contract.js";

export type UplinkData = Pick<Uplink,
    | "uplink_id"
    | "project_id"
    | "tts_device_id"
    | "raw_payload"
    | "status"
    | "created_at"
    | "updated_at"
>
export type PaginatedUplinkData = PaginationResult<UplinkData[]>
export type UplinkContract = Contract<UplinkData>
export type ProjectUplinksContract = Contract<UplinkData[]>
export type UplinksContract = Contract<UplinkData[]>
export type UplinkPaginationContract = Contract<PaginatedUplinkData>

export type DeviceData = Pick<Device,
    | "device_id"
    | "tts_device_id"
    | "is_hidden"
    | "is_pinned"
    | "label"
    | "description"
    | "project_id"
    | "origin_uplink_id"
    | "updated_at"
    | "created_at"
    | "config_reading_id">
export type DeviceConfigurationData = {
    device: DeviceData;
    configuration: Pick<Reading,
        | "reading_id"
        | "road_primary_direction"
        | "road_secondary_direction"
        | "road_type"
    > | null
}
export type DeviceContract = Contract<DeviceData>
export type DeviceConfigurationContract = Contract<DeviceConfigurationData>
export type DevicesContract = Contract<DeviceData[]>

export type ReadingData = Pick<Reading,
    | "created_at"
    | "device_id"
    | "reading_id"
    | "project_id"
    | "uplink_id"
    | "vehicle_detection_time"
    | "vehicle_speed"
    | "vehicle_type"
    | "vehicle_direction"
    | "vehicle_lane"
    | "road_type"
    | "road_primary_direction"
    | "road_secondary_direction"
>
export type PagiantedReadingData = PaginationResult<ReadingData[]>
export type ProjectReadingsContract = Contract<ReadingData[]>
export type ReadingsContract = Contract<ReadingData[]>
export type ReadingPaginationContract = Contract<PagiantedReadingData>
export type ReadingContract = Contract<ReadingData>

export type StatusData = Pick<Status,
    | "status_id"
    | "uplink_id"
    | "device_id"
    | "project_id"
    | "device_battery_level"
    | "device_storage_level"
    | "device_sensor_status"
    | "status_capture_time"
    | "created_at"
>
export type ProjectStatusData = Array<StatusData>
export type p_ErrorSummary = {
    battery: {
        threshold: number
        present: boolean
    }
    storage: {
        threshold: number
        present: boolean
    }
}
export type DeviceStatusData = {
    device: DeviceData,
    status: StatusData,
    errorSummary: p_ErrorSummary | null
}
export type PaginatedStatusData = PaginationResult<StatusData[]>
export type PaginatedStatusContract = Contract<PaginatedStatusData>
export type ProjectStatusContract = Contract<ProjectStatusData>
export type StatusContract = Contract<StatusData>
export type DeviceStatusContract = Contract<DeviceStatusData>

export type CompositeVisualizationContract = Contract<CompositeVisualizationData>

export type SessionPreviewContract = Contract<SessionPreviewData>

export type DeviceSummaryVisualizationContract = Contract<DeviceVisualizationData>

export type DevicePreviewVisualizationContract = Contract<DevicePreviewVisualizationData>