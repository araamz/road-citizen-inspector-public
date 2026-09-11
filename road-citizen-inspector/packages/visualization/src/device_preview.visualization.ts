import type { TCDF_VEHICLE_TYPE } from "@road-citizen-inspector/tcd-uplink-protocol"
import type { DeviceAbstractQuery, DeviceDataSource, ReadingBreakdown, StatusSummary } from "./device.visualization.js"
import type { VisualizationBin, VisualizationData, VisualizationQuery } from "./visualization.js"

export type DevicePreviewSummaryData = {
    vehicleCounts: ReadingBreakdown,
    statusSummary: Array<StatusSummary>
}

export type DevicePreviewVisualizationQuery = VisualizationQuery<DeviceAbstractQuery>
export type DevicePreviewBin = VisualizationBin<DeviceDataSource, DevicePreviewSummaryData>
export type DevicePreviewVisualizationData = VisualizationData<DeviceDataSource, DevicePreviewSummaryData>