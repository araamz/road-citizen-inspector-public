import { useParentSize } from "@visx/responsive"
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale"
import { Fragment, useMemo } from "react"
import { Group } from "@visx/group"
import { Bar, BarGroup, LinePath } from "@visx/shape"
import { AxisBottom, AxisLeft, AxisRight } from "@visx/axis"
import { GridColumns, GridRows } from "@visx/grid"
import { curveCatmullRom } from "@visx/vendor/d3-shape"
import { Text } from "@visx/text"
import { GlyphDiamond } from "@visx/glyph"
import { VEHICLE_KEYS } from "./CompositeHistogramVisualization/CompositeHistogramVisualization"
import type { TextProps } from "@visx/text"
import type {
    DeviceVisualizationData,
    StatusSummary,
} from "@road-citizen-inspector/visualization"
import type { VehicleKey } from "@/constants"
import { VEHICLE_TYPES, VEHILCE_KEY_COLORS } from "@/constants"

// RenderingConfiguration Typing
type VisualizationRendering = {
    axis: boolean
    visualizationOpacity: number | null
    aidsOpacity: number | null
}

type VisualizationRenderingConfiguration = {
    status: VisualizationRendering
    counts: VisualizationRendering
}

// Datum Typing
type DatumTimeKey = {
    time: string
}

type VehicleCountDatum = DatumTimeKey & Record<VehicleKey, number>

type DeviceStorageDatum = DatumTimeKey &
    Pick<StatusSummary, "storageLevel" | "error">

type DeviceBatteryDatum = DatumTimeKey &
    Pick<StatusSummary, "batteryLevel" | "error">

type VisualizationArea<TDatumType> =
    | {
        type: "discrete"
        data: TDatumType
    }
    | {
        type: "continuous"
        data: Array<TDatumType>
    }

// Axis Prop API Typing
type DeviceHistogramAxisOptions = {
    label?: string
    labelOffset?: number
    tickOffset?: number
    hideTicks?: boolean
    tickLength?: number
    numTicks?: number
    forceGrid?: boolean;
}

type VerticalAxisOptions = {
    width: number
} & DeviceHistogramAxisOptions

type HorizontalAxisOptions = {
    height: number
} & DeviceHistogramAxisOptions

type TimeAxisOptions = {
    tickSpacing?: number
    tickFormatter?: (isoDateTime: string) => string
} & HorizontalAxisOptions

type MarginsOptions = {
    left: number
    right: number
    top: number
    bottom: number
}

type LayoutOptions = {
    binWidthPx: number
    dateGapRatio: number
    vehicleTypeGapRatio: number
}

const DEFAULT_TIME_AXIS: TimeAxisOptions = {
    height: 50,
    label: "Time",
    labelOffset: 30,
    tickOffset: 0,
    tickLength: 10,
    tickSpacing: 100,
}

const DEFAULT_COUNTS_AXIS: VerticalAxisOptions = {
    width: 70,
    label: "Vehicle Counts",
    labelOffset: 35,
    tickOffset: 0,
    tickLength: 10,
}

const DEFAULT_PERCENTAGE_AXIS: VerticalAxisOptions = {
    width: 70,
    label: "Status Percentage (%)",
    labelOffset: 35,
    tickOffset: 0,
    tickLength: 10,
}

const DEFAULT_LAYOUT: LayoutOptions = {
    binWidthPx: 100,
    dateGapRatio: 0.2,
    vehicleTypeGapRatio: 0.1,
}

const DEFAULT_MARGINS: MarginsOptions = {
    left: 0,
    right: 0,
    top: 10,
    bottom: 0,
}

const BASE_AXIS_LABEL_STYLING: TextProps = {
    fontSize: "0.7rem",
    fontWeight: 600,
}

const BOTTOM_TICK_LABEL_STYLING: TextProps = {
    textAnchor: "middle",
    dy: "0.30em",
    fontSize: "0.6rem",
    fontWeight: 600,
    fill: "oklch(55.6% 0 0)",
}

const VERTICAL_TICK_LABEL_STYLING: TextProps = {
    dy: "0.30em",
    fontSize: "0.6rem",
    fontWeight: 600,
    fill: "oklch(55.6% 0 0)",
}

// Component Prop API
export type DeviceHistogramVisualizationProps = {
    data: DeviceVisualizationData
    timeAxis?: Partial<TimeAxisOptions>
    countsAxis?: Partial<VerticalAxisOptions>
    percentageAxis?: Partial<VerticalAxisOptions>
    margins?: Partial<MarginsOptions>
    widthSizing?: "fit" | "content"
    layout?: Partial<LayoutOptions>
    overlays?: {
        batteryCurve?: boolean
        storageCurve?: boolean
        errorMarkers?: boolean
    }
    visibilityEmphasis: "status" | "counts" | "both"
}

export default function DeviceHistogramVisualization({
    data,
    timeAxis: timeAxisOverrides,
    countsAxis: countsAxisOverrides,
    percentageAxis: percentageAxisOverrides,
    layout: layoutOverrides,
    margins: marginsOverrides,
    widthSizing = "fit",
    visibilityEmphasis,
}: DeviceHistogramVisualizationProps) {
    const timeAxis = useMemo(
        () => ({ ...DEFAULT_TIME_AXIS, ...timeAxisOverrides }),
        [timeAxisOverrides]
    )

    const countsAxis = useMemo(
        () => ({ ...DEFAULT_COUNTS_AXIS, ...countsAxisOverrides }),
        [countsAxisOverrides]
    )

    const percentageAxis = useMemo(
        () => ({ ...DEFAULT_PERCENTAGE_AXIS, ...percentageAxisOverrides }),
        [percentageAxisOverrides]
    )

    const layout = useMemo(
        () => ({ ...DEFAULT_LAYOUT, ...layoutOverrides }),
        [layoutOverrides]
    )

    const margins = useMemo(
        () => ({ ...DEFAULT_MARGINS, ...marginsOverrides }),
        [marginsOverrides]
    )

    const { width, height, parentRef } = useParentSize()

    const datums = useMemo(() => {
        const statusSummaries = data.bins
            .map(({ start, processed }) => ({
                start,
                statusSummary: processed.statusSummary,
            }))
            .map(({ start, statusSummary }) => {
                if (statusSummary.length === 0) return null

                if (statusSummary.length > 1) {
                    const latestStatus = statusSummary.reduce((acc, summary) => {
                        const accTimestamp = new Date(acc.captureTime).getTime()
                        const summaryTimestamp = new Date(summary.captureTime).getTime()

                        if (summaryTimestamp > accTimestamp) return summary
                        return acc
                    }, statusSummary[0])

                    return {
                        start,
                        ...latestStatus,
                    }
                }

                return {
                    start,
                    ...statusSummary[0],
                }
            })

        const processStorageDatums = (): Array<
            VisualizationArea<DeviceStorageDatum>
        > => {
            const storageDatums: Array<DeviceStorageDatum | null> =
                statusSummaries.map((summary) => {
                    if (summary === null) return null

                    return {
                        time: new Date(summary.start).toISOString(),
                        storageLevel: summary.storageLevel,
                        error: summary.error,
                    }
                })

            const segments: Array<Array<DeviceStorageDatum>> = []
            let currentSegment: Array<DeviceStorageDatum> = []

            for (const datum of storageDatums) {
                if (datum !== null) {
                    currentSegment.push(datum)
                } else if (currentSegment.length > 0) {
                    segments.push(currentSegment)
                    currentSegment = []
                }
            }

            if (currentSegment.length > 0) {
                segments.push(currentSegment)
            }

            return segments.map((segment): VisualizationArea<DeviceStorageDatum> => {
                if (segment.length === 1) {
                    return {
                        type: "discrete",
                        data: segment[0],
                    }
                }

                return {
                    type: "continuous",
                    data: segment,
                }
            })
        }

        const processBatteryDatums = (): Array<
            VisualizationArea<DeviceBatteryDatum>
        > => {
            const batteryDatums: Array<DeviceBatteryDatum | null> =
                statusSummaries.map((summary) => {
                    if (summary === null) return null

                    return {
                        time: new Date(summary.start).toISOString(),
                        batteryLevel: summary.batteryLevel,
                        error: summary.error,
                    }
                })

            const segments: Array<Array<DeviceBatteryDatum>> = []
            let currentSegment: Array<DeviceBatteryDatum> = []

            for (const datum of batteryDatums) {
                if (datum !== null) {
                    currentSegment.push(datum)
                } else if (currentSegment.length > 0) {
                    segments.push(currentSegment)
                    currentSegment = []
                }
            }

            if (currentSegment.length > 0) {
                segments.push(currentSegment)
            }

            return segments.map((segment): VisualizationArea<DeviceBatteryDatum> => {
                if (segment.length === 1) {
                    return {
                        type: "discrete",
                        data: segment[0],
                    }
                }

                return {
                    type: "continuous",
                    data: segment,
                }
            })
        }

        const vehicleCounts = data.bins.map((bin): VehicleCountDatum => {
            const breakdown = bin.processed.vehicleCounts

            return {
                time: new Date(bin.start).toISOString(),
                car: breakdown.car,
                motorcycle: breakdown.motorcycle,
                truck: breakdown.truck,
                unknown: breakdown.unknown,
            }
        })

        return {
            vehicleCounts,
            storageStatus: processStorageDatums(),
            batteryStatus: processBatteryDatums(),
        }
    }, [data])

    const maxCount = useMemo(() => {
        const max = Math.max(
            ...data.bins.map((bin) => bin.processed.vehicleCounts.cumulative)
        )

        return Math.max(max + max * 0.01, 10)
    }, [data])

    const innerHeight = useMemo(
        () => height - margins.top - margins.bottom,
        [height, margins.top, margins.bottom]
    )

    const innerWidth = useMemo(
        () => width - margins.left - margins.right,
        [width, margins.left, margins.right]
    )

    const renderingConfiguration =
        useMemo((): VisualizationRenderingConfiguration => {
            if (visibilityEmphasis === "counts") {
                return {
                    status: {
                        axis: false,
                        visualizationOpacity: 0.25,
                        aidsOpacity: null,
                    },
                    counts: {
                        axis: true,
                        visualizationOpacity: 1,
                        aidsOpacity: widthSizing === "fit" ? null : 1,
                    },
                }
            }

            if (visibilityEmphasis === "status") {
                return {
                    status: {
                        axis: true,
                        visualizationOpacity: 1,
                        aidsOpacity: 1,
                    },
                    counts: {
                        axis: false,
                        visualizationOpacity: 0.25,
                        aidsOpacity: null,
                    },
                }
            }

            return {
                status: {
                    axis: false,
                    visualizationOpacity: 0.25,
                    aidsOpacity: 1,
                },
                counts: {
                    axis: false,
                    visualizationOpacity: 1,
                    aidsOpacity: null,
                },
            }
        }, [visibilityEmphasis, widthSizing])

    const histogramDimensions = useMemo(() => {
        const hgHeight = innerHeight - timeAxis.height
        let hgWidth = 0

        if (widthSizing === "fit") {
            hgWidth = innerWidth - countsAxis.width - percentageAxis.width
        } else {
            const computedWidth = layout.binWidthPx * datums.vehicleCounts.length

            if (computedWidth < innerWidth) {
                hgWidth = innerWidth - countsAxis.width - percentageAxis.width
            } else {
                hgWidth =
                    layout.binWidthPx * datums.vehicleCounts.length -
                    countsAxis.width -
                    percentageAxis.width
            }
        }

        return {
            width: hgWidth,
            height: hgHeight,
        }
    }, [
        innerWidth,
        innerHeight,
        countsAxis.width,
        percentageAxis.width,
        timeAxis.height,
        datums.vehicleCounts.length,
        widthSizing,
        layout.binWidthPx,
    ])

    const visualizationDimensions = useMemo(() => {
        const vizWidth =
            margins.left +
            countsAxis.width +
            histogramDimensions.width +
            percentageAxis.width +
            margins.right

        return {
            width: vizWidth,
            height,
        }
    }, [
        height,
        histogramDimensions.width,
        margins.left,
        countsAxis.width,
        percentageAxis.width,
        margins.right,
    ])

    const timeTickCount = useMemo(() => {
        const targetTickSpacing = timeAxis.tickSpacing ?? DEFAULT_TIME_AXIS.tickSpacing ?? 100

        return Math.max(
            2,
            Math.min(
                datums.vehicleCounts.length,
                Math.floor(histogramDimensions.width / targetTickSpacing)
            )
        )
    }, [
        datums.vehicleCounts.length,
        histogramDimensions.width,
        timeAxis.tickSpacing,
    ])

    const getCountDatumKey = (datum: DatumTimeKey) => {
        return new Date(datum.time).toISOString()
    }

    const percentageScale = useMemo(
        () =>
            scaleLinear({
                domain: [0, 100],
                range: [histogramDimensions.height, 0],
            }),
        [histogramDimensions.height]
    )

    const countsScale = useMemo(
        () =>
            scaleLinear({
                domain: [0, maxCount],
                range: [histogramDimensions.height, 0],
                nice: true,
            }),
        [histogramDimensions.height, maxCount]
    )

    const dateScale = useMemo(
        () =>
            scaleBand({
                domain: datums.vehicleCounts.map(getCountDatumKey),
                range: [0, histogramDimensions.width],
                paddingInner: layout.dateGapRatio,
            }),
        [histogramDimensions.width, datums.vehicleCounts, layout.dateGapRatio]
    )

    const vehicleScale = useMemo(
        () =>
            scaleBand({
                domain: [...VEHICLE_TYPES],
                range: [0, dateScale.bandwidth()],
                paddingInner: layout.vehicleTypeGapRatio,
            }),
        [dateScale, layout.vehicleTypeGapRatio]
    )

    const vehicleColorScale = useMemo(
        () =>
            scaleOrdinal({
                domain: [...VEHICLE_KEYS],
                range: [...VEHILCE_KEY_COLORS],
            }),
        []
    )

    return (
        <div ref={parentRef} className="w-full h-full">
            {width > 0 && height > 0 && (
                <svg
                    width={visualizationDimensions.width}
                    height={visualizationDimensions.height}
                >
                    <Group left={margins.left + countsAxis.width} top={margins.top}>
                        {(renderingConfiguration.counts.axis || countsAxis.forceGrid) && (
                            <GridRows
                                scale={countsScale}
                                width={histogramDimensions.width}
                                stroke="oklch(92.2% 0 0)"
                                strokeDasharray="4"
                            />
                        )}

                        {(renderingConfiguration.status.axis || percentageAxis.forceGrid) && (
                            <GridRows
                                scale={percentageScale}
                                width={histogramDimensions.width}
                                stroke="oklch(92.2% 0 0)"
                                strokeDasharray="4"
                            />
                        )}

                        <GridColumns
                            scale={dateScale}
                            height={histogramDimensions.height}
                            stroke="oklch(92.2% 0 0)"
                            numTicks={datums.vehicleCounts.length}
                        />
                    </Group>

                    <Group left={margins.left} top={margins.top}>
                        {countsAxis.width > 0 && renderingConfiguration.counts.axis && (
                            <AxisLeft
                                left={countsAxis.width}
                                scale={countsScale}
                                label={countsAxis.label}
                                labelOffset={countsAxis.labelOffset}
                                tickLength={countsAxis.tickLength}
                                hideTicks={countsAxis.hideTicks}
                                numTicks={countsAxis.numTicks}
                                hideAxisLine
                                stroke="oklch(92.2% 0 0)"
                                tickStroke="oklch(92.2% 0 0)"
                                labelProps={{
                                    ...BASE_AXIS_LABEL_STYLING,
                                }}
                                tickLabelProps={{
                                    ...VERTICAL_TICK_LABEL_STYLING,
                                }}
                            />
                        )}

                        {percentageAxis.width > 0 && renderingConfiguration.status.axis && (
                            <AxisRight
                                left={countsAxis.width + histogramDimensions.width}
                                scale={percentageScale}
                                label={percentageAxis.label}
                                labelOffset={percentageAxis.labelOffset}
                                tickLength={percentageAxis.tickLength}
                                hideTicks={percentageAxis.tickLength === undefined ? true : false}
                                numTicks={percentageAxis.numTicks}
                                hideAxisLine
                                stroke="oklch(92.2% 0 0)"
                                tickStroke="oklch(92.2% 0 0)"
                                labelProps={{
                                    ...BASE_AXIS_LABEL_STYLING,
                                }}
                                tickLabelProps={{
                                    ...VERTICAL_TICK_LABEL_STYLING,
                                }}
                                tickFormat={(value) => `${value}%`}
                            />
                        )}

                        {timeAxis.height > 0 && (
                            <AxisBottom
                                left={countsAxis.width}
                                top={histogramDimensions.height}
                                scale={dateScale}
                                label={timeAxis.label}
                                labelOffset={timeAxis.labelOffset}
                                tickLength={timeAxis.tickLength}
                                numTicks={timeTickCount}
                                stroke="oklch(92.2% 0 0)"
                                tickStroke="oklch(92.2% 0 0)"
                                labelProps={{
                                    ...BASE_AXIS_LABEL_STYLING,
                                }}
                                tickLabelProps={{
                                    ...BOTTOM_TICK_LABEL_STYLING,
                                }}
                                tickFormat={timeAxis.tickFormatter}
                            />
                        )}
                    </Group>

                    <Group left={margins.left + countsAxis.width} top={margins.top}>
                        {renderingConfiguration.counts.visualizationOpacity !== null && (
                            <Group opacity={renderingConfiguration.counts.visualizationOpacity}>
                                <BarGroup<VehicleCountDatum, VehicleKey>
                                    data={datums.vehicleCounts}
                                    keys={[...VEHICLE_TYPES]}
                                    height={histogramDimensions.height}
                                    x0={getCountDatumKey}
                                    x0Scale={dateScale}
                                    x1Scale={vehicleScale}
                                    yScale={countsScale}
                                    color={vehicleColorScale}
                                >
                                    {(barGroups) =>
                                        barGroups.map((barGroup) => (
                                            <Group
                                                left={barGroup.x0}
                                                key={`bar-group-${barGroup.index}-${barGroup.x0}`}
                                            >
                                                {barGroup.bars.map((bar) => (
                                                    <Fragment
                                                        key={`vehicle-count-bar-${barGroup.index}-${bar.index}-${bar.key}`}
                                                    >
                                                        <Bar
                                                            x={bar.x}
                                                            y={bar.y}
                                                            width={bar.width}
                                                            height={bar.height}
                                                            fill={bar.color}
                                                        />

                                                        {renderingConfiguration.counts.aidsOpacity !==
                                                            null && (
                                                                <Text
                                                                    x={bar.x + 5}
                                                                    y={bar.y + bar.width / 2}
                                                                    textAnchor="start"
                                                                    verticalAnchor="middle"
                                                                    transform={`rotate(-90, ${bar.x}, ${bar.y})`}
                                                                    style={{
                                                                        fontSize: 11,
                                                                        fill: "oklch(55.6% 0 0)",
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    {bar.value.toLocaleString()}
                                                                </Text>
                                                            )}
                                                    </Fragment>
                                                ))}
                                            </Group>
                                        ))
                                    }
                                </BarGroup>
                            </Group>
                        )}

                        {renderingConfiguration.status.visualizationOpacity !== null && (
                            <Group opacity={renderingConfiguration.status.visualizationOpacity}>
                                {datums.batteryStatus.map((segment, idx) => {
                                    if (segment.type === "discrete") {
                                        const x =
                                            (dateScale(segment.data.time) ?? 0) +
                                            dateScale.bandwidth() / 2
                                        const y = percentageScale(segment.data.batteryLevel)

                                        return (
                                            <GlyphDiamond
                                                key={`device-histogram-battery-curve-point-${idx}`}
                                                left={x}
                                                top={y}
                                                size={100}
                                                fill="oklch(52.7% 0.154 150.069)"
                                                stroke="white"
                                                strokeWidth={1}
                                            />
                                        )
                                    }

                                    return (
                                        <Fragment key={`battery-segment-${idx}`}>
                                            <LinePath
                                                curve={curveCatmullRom}
                                                data={segment.data}
                                                x={(d) =>
                                                    (dateScale(getCountDatumKey(d)) ?? 0) +
                                                    dateScale.bandwidth() / 2
                                                }
                                                y={(d) => percentageScale(d.batteryLevel)}
                                                stroke="oklch(72.3% 0.219 149.579)"
                                                strokeWidth={1.5}
                                                shapeRendering="geometricPrecision"
                                            />

                                            {segment.data.map((d) => {
                                                const x =
                                                    (dateScale(d.time) ?? 0) + dateScale.bandwidth() / 2
                                                const y = percentageScale(d.batteryLevel)

                                                return renderingConfiguration.status.aidsOpacity !==
                                                    null ? (
                                                    <GlyphDiamond
                                                        key={`device-histogram-battery-${d.time}`}
                                                        left={x}
                                                        top={y}
                                                        size={100}
                                                        fill="oklch(52.7% 0.154 150.069)"
                                                        stroke="white"
                                                        strokeWidth={2}
                                                        opacity={renderingConfiguration.status.aidsOpacity}
                                                    />
                                                ) : null
                                            })}
                                        </Fragment>
                                    )
                                })}

                                {datums.storageStatus.map((segment, idx) => {
                                    if (segment.type === "discrete") {
                                        const x =
                                            (dateScale(segment.data.time) ?? 0) +
                                            dateScale.bandwidth() / 2
                                        const y = percentageScale(segment.data.storageLevel)

                                        return (
                                            <GlyphDiamond
                                                key={`device-histogram-storage-curve-point-${idx}`}
                                                left={x}
                                                top={y}
                                                size={100}
                                                fill="oklch(50% 0.134 242.749)"
                                                stroke="white"
                                                strokeWidth={1}
                                            />
                                        )
                                    }

                                    return (
                                        <Fragment key={`storage-segment-${idx}`}>
                                            <LinePath
                                                curve={curveCatmullRom}
                                                data={segment.data}
                                                x={(d) =>
                                                    (dateScale(getCountDatumKey(d)) ?? 0) +
                                                    dateScale.bandwidth() / 2
                                                }
                                                y={(d) => percentageScale(d.storageLevel)}
                                                stroke="oklch(68.5% 0.169 237.323)"
                                                strokeWidth={1.5}
                                                shapeRendering="geometricPrecision"
                                            />

                                            {segment.data.map((d) => {
                                                const x =
                                                    (dateScale(d.time) ?? 0) + dateScale.bandwidth() / 2
                                                const y = percentageScale(d.storageLevel)

                                                return renderingConfiguration.status.aidsOpacity !==
                                                    null ? (
                                                    <GlyphDiamond
                                                        key={`device-histogram-storage-${d.time}`}
                                                        left={x}
                                                        top={y}
                                                        size={100}
                                                        fill="oklch(50% 0.134 242.749)"
                                                        stroke="white"
                                                        strokeWidth={2}
                                                        opacity={renderingConfiguration.status.aidsOpacity}
                                                    />
                                                ) : null
                                            })}
                                        </Fragment>
                                    )
                                })}
                            </Group>
                        )}
                    </Group>
                </svg>
            )}
        </div>
    )
}