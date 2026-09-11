import type { Reading, ReadingQuery, Status, StatusQuery } from "@road-citizen-inspector/models"
import type { TCDF_DIRECTION_TYPE, TCDF_VEHICLE_TYPE } from "@road-citizen-inspector/tcd-uplink-protocol"
import type { VisualizationBin, VisualizationData, VisualizationQuery } from "./visualization.js"

export type ReadingBreakdownKey = TCDF_VEHICLE_TYPE | "cumulative"
export type ReadingBreakdown = Record<ReadingBreakdownKey, number>
export type StatusErrorInformation = {
    threshold: number,
    present: boolean
}

export type SpeedRangeData = {
    index: number;
    minMph: number;
    maxMph: number;
    breakdown: ReadingBreakdown;
}

export type SpeedRangeSummary = {
    minuteTimestamp: Date,
    speedRanges: Array<SpeedRangeData>
}

export type StatusSummary = {
    error: {
        storage: StatusErrorInformation 
        battery: StatusErrorInformation
    } | null
    storageLevel: number,
    batteryLevel: number,
    captureTime: string;
}

export type DeviceSummaryData = {
    vehicleCounts: ReadingBreakdown
    directionCounts: Record<TCDF_DIRECTION_TYPE, ReadingBreakdown>
    avgSpeedSummary: Record<TCDF_DIRECTION_TYPE, ReadingBreakdown>
    speedRangeSummary: Array<SpeedRangeSummary>
    laneCounts: Record<number, ReadingBreakdown>
    statusSummary: Array<StatusSummary>
}

export type DeviceDataSource =
  | { type: "reading"; reading: Reading }
  | { type: "status"; status: Status }

export type DeviceAbstractQuery = {
  reading?: ReadingQuery
  status?: StatusQuery
}

export type DeviceVisualizationQuery = VisualizationQuery<DeviceAbstractQuery>
export type DeviceBin = VisualizationBin<DeviceDataSource, DeviceSummaryData>
export type DeviceVisualizationData = VisualizationData<DeviceDataSource, DeviceSummaryData>