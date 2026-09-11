import {
    Device,
    DeviceModel,
    Reading,
    ReadingModel,
    Session,
    StatusModel,
} from "@road-citizen-inspector/models";
import { serverMap } from "@road-citizen-inspector/server-map/map"
import {
    CompositeBin,
    CompositeBreakdown,
    CompositeData,
    CompositeVisualizationData,
    CompositeVisualizationQuery,
    DeviceDataSource,
    DeviceVisualizationQuery,
    ReadingBreakdown,
    SessionPreviewBin,
    SessionPreviewBreakdown,
    SessionPreviewData,
    StatusSummary,
    DeviceSummaryData,
    VisualizationBin,
    StatusErrorInformation,
    DeviceVisualizationData,
    DeviceBin,
    ReadingBreakdownKey,
    DeviceAbstractQuery,
    DevicePreviewSummaryData,
    DevicePreviewBin,
    DevicePreviewVisualizationData,
    SpeedRangeData,
    SpeedRangeSummary,
} from "@road-citizen-inspector/visualization";
import Service, { ServiceError } from "./service.js";
import { DeviceContract, SessionContract } from "@road-citizen-inspector/contracts";

import { APP_THRESHOLDS } from "../constants.js";

const SENSOR_STATUS = ['ok', 'error'] as const
type SensorStatusType = typeof SENSOR_STATUS[number]

const LANES = [1, 2, 3, 4]

const VEHICLE_TYPES = ["car", "truck", "motorcycle", "unknown"] as const;
type VehicleKey = (typeof VEHICLE_TYPES)[number];

const DIRECTIONS = [
    "north",
    "south",
    "east",
    "west",
    "northeast",
    "southeast",
    "southwest",
    "northwest",
] as const;

type DirectionKey = (typeof DIRECTIONS)[number];

export class VisualizationService extends Service {
    private readingModel: ReadingModel;
    private statusModel: StatusModel;
    private deviceModel: DeviceModel;

    constructor(readingModel: ReadingModel, statusModel: StatusModel, deviceModel: DeviceModel) {
        super();
        this.readingModel = readingModel;
        this.statusModel = statusModel;
        this.deviceModel = deviceModel;
    }

    private SessionNotClaimedError(
        message: string,
        details: Pick<Session, "session_id">
    ) {
        return new ServiceError(
            `Failed to create visualization error because session is not claimed. ${message}`,
            "session_not_claimed_error",
            details
        )
    }


    private SessionPreviewVisualizationError(
        message: string,
        details: Pick<Session, "session_id"> | CompositeVisualizationQuery
    ) {
        return new ServiceError(
            `Failed to generate session preview. ${message}`,
            "session_preview_error",
            details
        )
    }

    private CompositeVisualizationDeviceError(
        message: string,
        details: Pick<Device, 'device_id'>
    ) {
        return new ServiceError(
            `Failed to generate composite bins for given devices. ${message}`,
            "composite_visualization_device_error",
            details
        )
    }

    private VisualizationBinProcessingError<QueryType>(
        message: string,
        details: QueryType
    ) {
        return new ServiceError(
            `Error processing bins for generate requested visualization. ${message}`,
            'visualization_bin_processing_error',
            details
        )
    }

    private VisualizationExternalServiceError<ErrorDetails = undefined>(
        message: string,
        details: ErrorDetails
    ) {
        return new ServiceError(
            `Error generating visualization due to external service. ${message}`,
            'visualization_external_service_error',
            details
        )
    }

    private async requestClaimedSession(sessionId: number) {
        return fetch(`${serverMap.services.RCI_SESSION_API}/session/${sessionId}`).then((response) => {
            if (!response.ok) throw this.VisualizationExternalServiceError<{
                sessionId: number
            }>(
                "Failed to query to external service for session claiming information.",
                {
                    sessionId
                }
            )

            return (response.json() as Promise<SessionContract>)
        }).then(({ success, data }) => {
            if (!success) throw this.VisualizationExternalServiceError<{
                sessionId: number
            }>(
                "Failed to query to external service for session claiming information.",
                {
                    sessionId
                }
            )

            if (data.status !== 'claimed') throw this.SessionNotClaimedError(
                "Session is not claimed and does not have data to generate session.",
                {
                    session_id: sessionId
                }
            )
            return data
        })
    }

    private async requestDevice(deviceId: number) {
        return fetch(`${serverMap.services.RCI_UPLINK_API}/device/${deviceId}`).then((response) => {
            if (!response.ok) throw this.VisualizationExternalServiceError<{
                deviceId: number
            }>(
                "Failed to query to external service for device information. ",
                {
                    deviceId
                }
            )

            return (response.json() as Promise<DeviceContract>)
        }).then(({ success, data }) => {
            if (!success) throw this.VisualizationExternalServiceError<{
                deviceId: number
            }>(
                "Failed to process data from external service for device information.",
                {
                    deviceId
                }
            )

            return data
        })
    }

    private generateEmptyVisualizationBins<DataType = any, ProcessedDataType = null>(
        start: Date,
        end: Date,
        durationMinutes: number,
        createInitalValue?: () => ProcessedDataType
    ): Array<VisualizationBin<DataType, ProcessedDataType | null>> {

        /* A end date can't be shorter than the interval */
        /* Going by minute-by-minute resolution. */
        const visualizationLength = (end.getTime() / 60_000) - (start.getTime() / 60_000)
        const MININUM_BIN_COUNT = 3
        let binCount = visualizationLength / durationMinutes;
        if (binCount >= MININUM_BIN_COUNT) binCount = Math.floor(visualizationLength / durationMinutes)
        else {
            binCount = MININUM_BIN_COUNT;
            end = new Date(start.getTime() + (durationMinutes * 60_000) * MININUM_BIN_COUNT);
        }
        const bins = []

        for (let idx = 0; idx < binCount; idx++) {

            const startMs = start.getTime() + (idx * durationMinutes * 60_000)
            const endMs = start.getTime() + ((idx + 1) * durationMinutes * 60_000)

            bins.push({
                index: idx,
                start: new Date(startMs),
                end: new Date(endMs),
                durationMinutes,
                data: [],
                processed: createInitalValue ? createInitalValue() : null
            })
        }

        return bins;

    }

    private createStatusSummary(storageThreshold: number, batteryThreshold: number, statusDataSource: DeviceDataSource): StatusSummary | null {

        if (statusDataSource.type !== 'status') return null;

        const status = statusDataSource.status;
        const sensorStatus = status.device_sensor_status as SensorStatusType

        if (sensorStatus === 'ok') {
            return {
                error: null,
                storageLevel: status.device_storage_level,
                batteryLevel: status.device_battery_level,
                captureTime: status.status_capture_time
            }
        } else {

            const storageInformation = (): StatusErrorInformation => {
                return {
                    threshold: storageThreshold,
                    present: status.device_storage_level < storageThreshold
                }
            }

            const batteryInformation = (): StatusErrorInformation => {
                return {
                    threshold: batteryThreshold,
                    present: status.device_battery_level < batteryThreshold
                }
            }

            return {
                error: {
                    storage: storageInformation(),
                    battery: batteryInformation()
                },
                storageLevel: status.device_storage_level,
                batteryLevel: status.device_battery_level,
                captureTime: status.status_capture_time
            }
        }

    }

    async generateCompositeData(
        projectId: number,
        includeData: boolean = false,
        query: CompositeVisualizationQuery
    ): Promise<CompositeVisualizationData> {

        const emptyCompositeBreakdown = (): CompositeBreakdown => ({
            car: 0,
            motorcycle: 0,
            truck: 0,
            unknown: 0,
            cumulative: 0
        })

        const emptyDirectionBreakdown = (): Record<DirectionKey, CompositeBreakdown> =>
            Object.fromEntries(
                DIRECTIONS.map((direction) => [direction, emptyCompositeBreakdown()])
            ) as Record<DirectionKey, CompositeBreakdown>;

        const emptyLaneBreakdown = (): Record<number, CompositeBreakdown> =>
            Object.fromEntries(
                LANES.map((lane) => [lane, emptyCompositeBreakdown()])
            ) as Record<number, CompositeBreakdown>

        const {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
            ...rest
        } = query;

        const data = await this.readingModel.getProjectReadings(projectId, {
            vehicle_detection_time_start: visualizationStart,
            vehicle_detection_time_end: visualizationEnd,
            sort_order: "asc",
            ...rest,
        });

        const bins = this.generateEmptyVisualizationBins<Reading>(
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes
        );

        for (let dataIdx = 0; dataIdx < data.length; dataIdx++) {
            for (let binIdx = 0; binIdx < bins.length; binIdx++) {
                if (new Date(data[dataIdx].vehicle_detection_time) >= bins[binIdx].start && new Date(data[dataIdx].vehicle_detection_time) < bins[binIdx].end) {
                    bins[binIdx].data!.push(data[dataIdx])
                }
            }
        }

        const processedBins: Array<CompositeBin> = await Promise.all(bins.map(async (bin): Promise<CompositeBin> => {

            if (!bin.data) throw new Error("Data from session is not retrived. Suspending operation.")

            const vehicleCounts = bin.data.reduce<CompositeData['vehicleCounts']>((acc, reading) => {

                const vehicleType = VEHICLE_TYPES.find((type) => type === reading.vehicle_type)

                if (!vehicleType) return acc;

                acc.cumulative += 1
                acc[vehicleType] += 1;

                return acc
            }, emptyCompositeBreakdown())

            const directionCounts = bin.data.reduce<CompositeData['directionCounts']>((acc, reading) => {

                const vehicleDirection = DIRECTIONS.find((direction) => direction === reading.vehicle_direction)
                const vehicleType = VEHICLE_TYPES.find((type) => type === reading.vehicle_type)

                if (!vehicleDirection || !vehicleType) return acc;

                acc[vehicleDirection].cumulative += 1;
                acc[vehicleDirection][vehicleType] += 1;

                return acc;

            }, emptyDirectionBreakdown())

            const laneCounts = bin.data.reduce<CompositeData['laneCounts']>((acc, reading) => {

                const vehicleLane = reading.vehicle_lane;
                const vehicleType = VEHICLE_TYPES.find((type) => type === reading.vehicle_type)

                if (vehicleLane == null || !vehicleType) return acc;

                acc[vehicleLane].cumulative += 1;
                acc[vehicleLane][vehicleType] += 1;

                return acc;

            }, emptyLaneBreakdown())

            const avgSpeedSummary = Object.fromEntries(
                Object.entries(
                    bin.data.reduce<CompositeData['avgSpeedSummary']>((acc, reading) => {

                        const vehicleType = VEHICLE_TYPES.find((type) => type === reading.vehicle_type)
                        const vehicleDirection = DIRECTIONS.find((direction) => direction === reading.vehicle_direction)

                        if (!vehicleType || !vehicleDirection) return acc;

                        acc[vehicleDirection].cumulative += reading.vehicle_speed
                        acc[vehicleDirection][vehicleType] += reading.vehicle_speed

                        return acc

                    }, emptyDirectionBreakdown())
                ).map(([direction, composite]) => {

                    const vehicleDirection = DIRECTIONS.find((dir) => dir === direction)
                    if (!vehicleDirection) return [direction, composite]

                    const counts = directionCounts[vehicleDirection]

                    const averaged: CompositeBreakdown = {
                        car: counts.car ? Math.ceil(composite.car / counts.car) : 0,
                        truck: counts.truck ? Math.ceil(composite.truck / counts.truck) : 0,
                        motorcycle: counts.motorcycle ? Math.ceil(composite.motorcycle / counts.motorcycle) : 0,
                        unknown: counts.unknown ? Math.ceil(composite.unknown / counts.unknown) : 0,
                        cumulative: counts.cumulative
                            ? Math.ceil(composite.cumulative / counts.cumulative)
                            : 0
                    }

                    return [direction, averaged]
                })
            ) as Record<DirectionKey, CompositeBreakdown>

            const contributionCounts = await Promise.all(
                Object.entries(bin.data.reduce<Record<number, number>>((acc, reading) => {
                    if (acc[reading.device_id] === undefined) acc[reading.device_id] = 1
                    else acc[reading.device_id] += 1
                    return acc;
                }, {})).map(async ([deviceId, count]) => {
                    const device = await this.deviceModel.getDeviceByDeviceId(Number(deviceId))

                    if (!device) throw this.CompositeVisualizationDeviceError(
                        `Device couldn't be found for device contribution data.`,
                        {
                            device_id: Number(deviceId)
                        }
                    )

                    return {
                        device,
                        count
                    }
                })
            )

            return {
                index: bin.index,
                start: bin.start,
                end: bin.end,
                durationMinutes: bin.durationMinutes,
                processed: {
                    vehicleCounts,
                    directionCounts,
                    laneCounts,
                    avgSpeedSummary,
                    contributionCounts
                },
                data: includeData ? bin.data : undefined
            }

        }))

        return {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
            bins: processedBins
        }
    }

    async generateSessionPreview(
        sessionId: number,
        includeData: boolean = false,
        query: CompositeVisualizationQuery
    ): Promise<SessionPreviewData> {

        // First Query to see if session is claimed and is claimed with a projectId
        const session = await this.requestClaimedSession(sessionId)

        if (session.visibility === 'private') throw this.SessionPreviewVisualizationError(
            "Session is private and a preview can't be generated.",
            {
                session_id: sessionId,
                ...query
            }
        )

        const {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
            ...rest
        } = query;

        const data = await this.readingModel.getProjectReadings(session.project_id, {
            vehicle_detection_time_start: visualizationStart,
            vehicle_detection_time_end: visualizationEnd,
            sort_order: "asc",
            ...rest,
        })

        const emptySessionPreviewBreakdown = (): SessionPreviewBreakdown => ({
            car: 0,
            motorcycle: 0,
            truck: 0,
            unknown: 0,
            cumulative: 0
        })

        const bins = this.generateEmptyVisualizationBins<Reading, SessionPreviewBreakdown>(
            query.visualizationStart,
            query.visualizationEnd,
            query.intervalDurationMinutes,
            emptySessionPreviewBreakdown
        )

        for (let dataIdx = 0; dataIdx < data.length; dataIdx++) {
            for (let binIdx = 0; binIdx < bins.length; binIdx++) {
                const startDateTime = new Date(bins[binIdx].start)
                const endDateTime = new Date(bins[binIdx].end)
                const readingDateTime = new Date(data[dataIdx].vehicle_detection_time)
                if ((readingDateTime >= startDateTime) && (readingDateTime < endDateTime)) {
                    bins[binIdx].data!.push(data[dataIdx])
                }
            }

        }

        const processedBins = bins.map((bin): SessionPreviewBin => {

            if (!bin.processed) throw this.SessionPreviewVisualizationError(
                "Visualization bin is missing a inital processed state for Session Preview.",
                {
                    session_id: sessionId,
                    ...query
                }
            )

            if (!bin.data) throw this.VisualizationBinProcessingError(
                "Data is required for processing of Session Preview.",
                query
            )

            const initalBreakdown = emptySessionPreviewBreakdown()

            const processed = bin.data.reduce((breakdown, reading) => {

                const vt = VEHICLE_TYPES.find((t) => reading.vehicle_type === t)

                if (!vt) throw this.VisualizationBinProcessingError(
                    "Vehicle type unknown for Session Preview visualization bins.",
                    query
                )

                breakdown[vt] += 1;
                breakdown['cumulative'] += 1;

                return breakdown;
            }, initalBreakdown)

            if (includeData) return {
                ...bin,
                data: bin.data,
                processed
            }
            else return {
                ...bin,
                processed,
                data: undefined
            }
        })

        return {
            intervalDurationMinutes: query.intervalDurationMinutes,
            visualizationStart: query.visualizationStart,
            visualizationEnd: query.visualizationEnd,
            bins: processedBins
        }
    }

    createReadingBreakdown(): ReadingBreakdown {
        return {
            car: 0,
            truck: 0,
            motorcycle: 0,
            unknown: 0,
            cumulative: 0
        }
    }

    async generateDeviceData(
        deviceId: number,
        includeData: boolean = false,
        query: DeviceVisualizationQuery
    ): Promise<DeviceVisualizationData> {

        const device = await this.requestDevice(deviceId)

        const {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
        } = query

        const createDirectionBreakdown = (): Record<DirectionKey, ReadingBreakdown> => (
            Object.fromEntries(DIRECTIONS.map((dir) => [dir, this.createReadingBreakdown()])) as Record<DirectionKey, ReadingBreakdown>
        )

        const createLaneBreakdown = (): Record<number, ReadingBreakdown> => (
            Object.fromEntries(LANES.map((lane) => [lane, this.createReadingBreakdown()]))
        )

        const createSummaryData = (): DeviceSummaryData => ({
            vehicleCounts: this.createReadingBreakdown(),
            directionCounts: createDirectionBreakdown(),
            avgSpeedSummary: createDirectionBreakdown(),
            speedRangeSummary: [],
            laneCounts: createLaneBreakdown(),
            statusSummary: []
        })

        const bins = this.generateEmptyVisualizationBins<DeviceDataSource, DeviceSummaryData>(
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
            createSummaryData
        )

        const readingData: Array<DeviceDataSource> = await this.readingModel.getProjectReadings(device.project_id, {
            vehicle_detection_time_start: visualizationStart,
            vehicle_detection_time_end: visualizationEnd,
            device_ids: [deviceId],
            sort_order: "asc",
            ...query.reading
        }).then((readings) => readings.map((reading) => ({
            type: 'reading',
            reading
        })))

        const statusData: Array<DeviceDataSource> = await this.statusModel.getProjectStatus(device.project_id, {
            status_capture_time_start: visualizationStart,
            status_capture_time_end: visualizationEnd,
            device_ids: [deviceId],
            sort_order: "asc",
            ...query.status
        }).then((status) => status.map((s) => ({
            type: 'status',
            status: s
        })))

        const sortedDeviceData = [...readingData, ...statusData]

        sortedDeviceData.sort((a, b) => {

            const aTimeMs =
                a.type === "reading"
                    ? new Date(a.reading.vehicle_detection_time).getTime()
                    : new Date(a.status.status_capture_time).getTime()

            const bTimeMs =
                b.type === "reading"
                    ? new Date(b.reading.vehicle_detection_time).getTime()
                    : new Date(b.status.status_capture_time).getTime()

            return aTimeMs - bTimeMs
        })

        for (let dataIdx = 0; dataIdx < sortedDeviceData.length; dataIdx++) {

            const dataSource = sortedDeviceData[dataIdx]

            const dataTimestampMs =
                dataSource.type === "reading"
                    ? new Date(dataSource.reading.vehicle_detection_time)
                    : new Date(dataSource.status.status_capture_time)

            for (let binIdx = 0; binIdx < bins.length; binIdx++) {
                const binStartTimestampMs = new Date(bins[binIdx].start)
                const binEndTimestampMs = new Date(bins[binIdx].end)

                if (dataTimestampMs >= binStartTimestampMs && dataTimestampMs < binEndTimestampMs) {

                    const bin = bins[binIdx]

                    if (!bin.data) {
                        throw this.VisualizationBinProcessingError(
                            "Failed to process raw data processing. Bin does not have an data array allocated.",
                            query
                        )
                    }

                    bin.data.push(dataSource)
                    break
                }
            }
        }

        const processedBins = bins.map((bin): DeviceBin => {

            const computeVehicleCounts = (data: DeviceDataSource[]): ReadingBreakdown => {

                const countBreakdown = this.createReadingBreakdown()

                const readingDataSource = data.filter((dataSource) => dataSource.type === 'reading')

                const processedVehicleCounts = readingDataSource.reduce((acc, r) => {

                    const vt = VEHICLE_TYPES.find((type) => type === r.reading.vehicle_type)

                    if (!vt) throw this.VisualizationBinProcessingError<{
                        vehicleType: string,
                        query: DeviceVisualizationQuery
                    }>(
                        "Error processing vehicle type for device vehicle count processing.",
                        {
                            vehicleType: r.reading.vehicle_type,
                            query
                        }
                    )

                    acc[vt] += 1;
                    acc['cumulative'] += 1;
                    return acc;
                }, countBreakdown)

                return processedVehicleCounts;
            }

            const computeDirectionCounts = (data: DeviceDataSource[]) => {

                const readingDataSource = data.filter((dataSource) => dataSource.type === 'reading')

                const directionBreakdown = createDirectionBreakdown()
                const processedDirectionCounts = readingDataSource.reduce((acc, { reading }) => {

                    const dir = DIRECTIONS.find((dir) => dir === reading.vehicle_direction)
                    const vt = VEHICLE_TYPES.find((t) => t === reading.vehicle_type)

                    if (!dir || !vt) throw this.VisualizationBinProcessingError<{
                        directionKey?: string,
                        vehicleType?: string
                    }>(
                        "Error processing device direction summary. Index terms are malformed.",
                        {
                            directionKey: dir,
                            vehicleType: vt
                        }
                    )

                    acc[dir][vt] += 1;
                    acc[dir]['cumulative'] += 1;

                    return acc;
                }, directionBreakdown)


                return processedDirectionCounts
            }

            const computeAvgSpeedSummary = (data: DeviceDataSource[]) => {
                const readingDataSource = data.filter((dataSource) => dataSource.type === 'reading')
                const emptySpeedCounts = Object.fromEntries(
                    DIRECTIONS.map((dir) => {
                        const vehicleBreakdownArrays = Object.fromEntries(
                            [...VEHICLE_TYPES, "cumulative"].map((t) => [t, [] as Array<number>])
                        ) as Record<VehicleKey | "cumulative", Array<number>>
                        return [dir, vehicleBreakdownArrays]
                    })
                ) as Record<DirectionKey, Record<VehicleKey | "cumulative", Array<number>>>

                const aggreatedSpeeds = readingDataSource.reduce((acc, { reading }) => {
                    const dir = DIRECTIONS.find((dir) => dir === reading.vehicle_direction)
                    const vt = VEHICLE_TYPES.find((vt) => vt === reading.vehicle_type)
                    if (!dir || !vt) throw this.VisualizationBinProcessingError<{
                        directionKey?: string,
                        vehicleType?: string
                    }>(
                        "Error processing device speeds for average speed summary. Index terms are malformed.",
                        {
                            directionKey: dir,
                            vehicleType: vt
                        }
                    )
                    acc[dir][vt].push(reading.vehicle_speed)
                    acc[dir]['cumulative'].push(reading.vehicle_speed)
                    return acc;
                }, emptySpeedCounts)


                const processedSpeeds = DIRECTIONS.map((dir) => {
                    const directionSpeeds = Object.entries(aggreatedSpeeds[dir])

                    const processed = Object.fromEntries(
                        directionSpeeds.map(([type, speeds]) => {

                            const itemCount = speeds.length;

                            if (itemCount === 0) return [type, 0]

                            const itemSum = speeds.reduce((acc, speed) => acc += speed, 0)
                            const avg = Math.ceil(itemSum / itemCount)
                            return [type, avg]
                        })
                    )

                    return [dir, processed]
                })

                const speedBreakdown = Object.fromEntries(processedSpeeds)

                return speedBreakdown
            }

            const createSpeedRangeSummary = (data: DeviceDataSource[]) => {

                const readings = data.filter((ds) => ds.type === "reading").map((ds) => ds.reading)

                if (readings.length === 0) return [];

                const generateSpeedRangeBins = (maxSpeedMph: number): SpeedRangeData[] => {

                    const SPEED_INTERVAL_MPH = 5

                    const binCount = Math.ceil(maxSpeedMph / SPEED_INTERVAL_MPH)

                    const bins = new Array(binCount).fill({
                        index: 0,
                        minMph: 0,
                        maxMph: 0
                    }).map((_, idx) => {

                        const minMph = 1 + (idx * SPEED_INTERVAL_MPH)
                        const maxMph = minMph + SPEED_INTERVAL_MPH - 1;

                        return {
                            index: idx,
                            minMph,
                            maxMph,
                            breakdown: this.createReadingBreakdown()
                        } as SpeedRangeData
                    })

                    return bins;
                }

                const generateMinuteBins = () => {

                    const minuteBins = new Array(60).fill(null).map((_, idx) => {
                        const stepMs = 1000 * 60;
                        const startOffsetMs = idx * stepMs
                        const endOffsetMs = idx * stepMs + stepMs
                        const startTimestamp = new Date(bin.start.getTime() + startOffsetMs)
                        const endTimestamp = new Date(bin.start.getTime() + endOffsetMs)

                        return {
                            startTimestamp,
                            endTimestamp,
                            readings: [] as Array<Reading>
                        }
                    })

                    for (let readingIdx = 0; readingIdx < readings.length; readingIdx++) {
                        for (let binIdx = 0; binIdx < minuteBins.length; binIdx++) {

                            const bin = minuteBins[binIdx]
                            const readingTimestamp = new Date(readings[readingIdx].vehicle_detection_time)

                            if (bin.startTimestamp <= readingTimestamp && readingTimestamp < bin.endTimestamp) {
                                bin.readings.push(readings[readingIdx])
                            } else continue;

                        }
                    }

                    return minuteBins

                }

                const globalMaxSpeed = Math.max(readings.reduce((acc, r) => Math.max(r.vehicle_speed, acc), readings[0].vehicle_speed), 25)

                const processedMinuteBins = generateMinuteBins()

                const speedRangeSummaries = processedMinuteBins.map((minuteBin): SpeedRangeSummary => {

                    const { readings, startTimestamp } = minuteBin;


                    // const binMaxSpeed = minuteBin.readings.reduce((acc, r) => Math.max(r.vehicle_speed, acc), readings[0].vehicle_speed)
                    const speedRanges = generateSpeedRangeBins(globalMaxSpeed)

                    if (readings.length > 0) {
                        for (let readingIdx = 0; readingIdx < readings.length; readingIdx++) {
                            for (let binIdx = 0; binIdx < speedRanges.length; binIdx++) {

                                const minSpeed = speedRanges[binIdx].minMph
                                const maxSpeed = speedRanges[binIdx].maxMph

                                if (!(minSpeed <= readings[readingIdx].vehicle_speed && readings[readingIdx].vehicle_speed <= maxSpeed)) continue;

                                const vt = VEHICLE_TYPES.find((t) => readings[readingIdx].vehicle_type === t)

                                if (!vt) throw this.VisualizationBinProcessingError<{
                                    vehicleType: string;
                                }>(
                                    "Failed to generate Speed Binning summary. Vehicle Type could not be indexed.",
                                    {
                                        vehicleType: readings[readingIdx].vehicle_type
                                    }
                                )

                                speedRanges[binIdx].breakdown[vt] += 1;
                                speedRanges[binIdx].breakdown.cumulative += 1
                                break;
                            }
                        }

                    }

                    return {
                        minuteTimestamp: startTimestamp,
                        speedRanges
                    }


                })

                return speedRangeSummaries;

            }

            const computeLaneCounts = (data: DeviceDataSource[]) => {

                const readingDataSource = data.filter((dataSource) => dataSource.type === 'reading')

                const laneBreakdown = createLaneBreakdown()
                const processedLaneCounts = readingDataSource.reduce((acc, { reading }) => {

                    const l = LANES.find((lane) => lane === Number(reading.vehicle_lane))
                    const vt = VEHICLE_TYPES.find((type) => type === reading.vehicle_type)

                    if (!l || !vt) throw this.VisualizationBinProcessingError<{
                        vehicleLane?: number,
                        vehicleType?: string
                    }>(
                        "Error processing device lane summary. Index terms are malformed.",
                        {
                            vehicleLane: l,
                            vehicleType: vt
                        }
                    )

                    acc[l][vt] += 1;
                    acc[l]['cumulative'] += 1;

                    return acc;
                }, laneBreakdown)

                return processedLaneCounts;

            }

            const computeStatusSummary = (data: DeviceDataSource[]): Array<StatusSummary> => {
                const statusDataSource = data.filter((dataSource) => dataSource.type === 'status')

                return statusDataSource.map((ds) => {
                    const errorInformation = this.createStatusSummary(
                        APP_THRESHOLDS.low_sensor_storage,
                        APP_THRESHOLDS.low_sensor_battery,
                        ds
                    )

                    if (errorInformation === null) throw this.VisualizationBinProcessingError<DeviceDataSource>(
                        "Error processing error information for device. Summary data source is malformed.",
                        ds
                    )

                    return errorInformation;
                })
            }

            if (!bin.data) throw this.VisualizationBinProcessingError(
                "Failed to process visualization bins to device summaries. Bin does not have an data array allocated.",
                query
            )
            const vehicleCounts = computeVehicleCounts(bin.data)
            const directionCounts = computeDirectionCounts(bin.data)
            const avgSpeedSummary = computeAvgSpeedSummary(bin.data)
            const speedRangeSummary = createSpeedRangeSummary(bin.data)
            const laneCounts = computeLaneCounts(bin.data)
            const statusSummary = computeStatusSummary(bin.data)

            const processed: DeviceSummaryData = {
                vehicleCounts,
                directionCounts,
                avgSpeedSummary,
                speedRangeSummary,
                laneCounts,
                statusSummary
            }

            if (includeData) {
                return {
                    ...bin,
                    data: bin.data,
                    processed
                }
            } else {
                return {
                    ...bin,
                    data: undefined,
                    processed
                }
            }

        })

        return {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
            bins: processedBins
        }

    }

    async generateDevicePreview(
        deviceId: number,
        includeData: boolean,
        query: DeviceVisualizationQuery
    ): Promise<DevicePreviewVisualizationData> {

        const device = await this.requestDevice(deviceId)

        const {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
        } = query;


        const bins = this.generateEmptyVisualizationBins<DeviceDataSource>(
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes
        )

        const readingData = await this.readingModel.getProjectReadings(device.project_id, {
            vehicle_detection_time_start: visualizationStart,
            vehicle_detection_time_end: visualizationEnd,
            device_ids: [deviceId],
            ...query.reading
        }).then((rs) => rs.map((reading): DeviceDataSource => ({
            type: 'reading',
            reading
        })))

        const statusData = await this.statusModel.getProjectStatus(device.project_id, {
            status_capture_time_start: visualizationStart,
            status_capture_time_end: visualizationEnd,
            device_ids: [deviceId],
            ...query.status
        }).then((ss) => ss.map((status): DeviceDataSource => ({
            type: 'status',
            status
        })))

        const sortedDeviceData = [...readingData, ...statusData]

        sortedDeviceData.sort((a, b) => {

            const aTimeMs =
                a.type === "reading"
                    ? new Date(a.reading.vehicle_detection_time).getTime()
                    : new Date(a.status.status_capture_time).getTime()

            const bTimeMs =
                b.type === "reading"
                    ? new Date(b.reading.vehicle_detection_time).getTime()
                    : new Date(b.status.status_capture_time).getTime()

            return aTimeMs - bTimeMs
        })

        for (let dataIdx = 0; dataIdx < sortedDeviceData.length; dataIdx++) {
            for (let binIdx = 0; binIdx < bins.length; binIdx++) {

                const dataSource = sortedDeviceData[dataIdx]
                const dsTimestamp = new Date(
                    dataSource.type === 'reading' ?
                        dataSource.reading.vehicle_detection_time : dataSource.status.status_capture_time
                )
                const startTimestamp = new Date(bins[binIdx].start)
                const endTimestamp = new Date(bins[binIdx].end)

                if ((startTimestamp <= dsTimestamp) && (endTimestamp > dsTimestamp)) {

                    const bin = bins[binIdx]

                    if (!bin.data) {
                        throw this.VisualizationBinProcessingError(
                            "Failed to process raw data processing. Bin does not have an data array allocated.",
                            query
                        )
                    }

                    bin.data.push(dataSource)
                    break
                }
            }
        }

        const processedBins = bins.map((bin): DevicePreviewBin => {

            if (!bin.data) throw this.VisualizationBinProcessingError(
                "Failed to process for vehicle counts. Bin does not have an data array allocated.",
                query
            )

            if (!bin.processed) throw this.VisualizationBinProcessingError(
                "Failed to process for vehicle counts. Bin does not have an reading breakdown.",
                query
            )

            const readingBreakdown = this.createReadingBreakdown()

            const vehicleCounts = bin.data.reduce((acc, ds) => {

                if (ds.type !== 'reading') return acc;

                const vt = VEHICLE_TYPES.find((t) => t === ds.reading.vehicle_type)

                if (!vt) throw this.VisualizationBinProcessingError(
                    "Failed to process vehicle count. Vehicle type couldn't be indexed.",
                    {
                        vehicleType: ds.reading.vehicle_type
                    }
                )

                acc[vt] += 1;
                acc['cumulative'] += 1;

                return acc;
            }, readingBreakdown)

            const statusErrorSummaries = [] as Array<StatusSummary>

            const statusSummary = bin.data.reduce((acc, ds) => {
                if (ds.type !== 'status') return acc;

                const summary: StatusSummary | null = this.createStatusSummary(
                    APP_THRESHOLDS.low_sensor_storage,
                    APP_THRESHOLDS.low_sensor_battery,
                    ds
                )

                if (summary) acc.push(summary)
                else {
                    throw this.VisualizationBinProcessingError(
                        "Failed to create status summary for visualization bin. Date source for summary was malformed.",
                        query
                    )
                }

                return acc;
            }, statusErrorSummaries)



            if (includeData) {
                return {
                    ...bin,
                    processed: {
                        vehicleCounts,
                        statusSummary
                    }
                }
            } else {
                return {
                    ...bin,
                    processed: {
                        vehicleCounts,
                        statusSummary
                    },
                    data: undefined
                }
            }

        })

        return {
            visualizationStart,
            visualizationEnd,
            intervalDurationMinutes,
            bins: processedBins
        }
    }
}