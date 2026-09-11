// Visualization Rendering
import { Group } from '@visx/group'
import { useParentSize } from "@visx/responsive"
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { Bar, BarGroup } from '@visx/shape'
import { Text } from '@visx/text'
import { GridColumns, GridRows } from '@visx/grid'

// React
import { useMemo } from "react"
import type { TickLabelProps } from '@visx/axis';

// Types
import type { CompositeVisualizationData } from "@road-citizen-inspector/visualization"

export const VEHICLE_KEYS = ["car", "motorcycle", "truck", "unknown"] as const
export const VEHICLE_KEY_COLORS: Array<string> = ["#f39c12", "#27ae60", "#c0392b", "#2c3e50"] as const
export type VehicleKey = typeof VEHICLE_KEYS[number]
export type SummaryDatum = Record<VehicleKey, number> & {
    time: string;
}

export type CompositeHistogramVisualizationProps = {
    visualizationData: CompositeVisualizationData
    widthSizing?: 'fit' | 'content',
    margins?: {
        left: number,
        right: number,
        top: number,
        bottom: number
    },
    dateAxis?: {
        height: number,
        mininumBinWidth: number;
        dateGapRatio: number;
        typeGapRatio: number;
        label?: string;
        ticksCount?: number; 
        tickFormatter?: (isoDateTime: string) => string;
        labelStyling?: TickLabelProps<string>;
        tickLabelStyling?: TickLabelProps<number>;
        labelOffset?: number;
    }
    countAxis?: {
        width: number;
        label?: string; // Added
        ticksCount?: number; // Added
        labelStyling?: TickLabelProps<number>; // Added
        tickLabelStyling?: TickLabelProps<number>; // Added
        labelOffset?: number;
    }
}

export default function CompositeHistogramVisualization({
    visualizationData,
    widthSizing = 'fit',
    margins = {
        left: 20,
        right: 20,
        top: 10,
        bottom: 5
    },
    dateAxis = {
        height: 30,
        mininumBinWidth: 100,
        dateGapRatio: 0.2,
        typeGapRatio: 0.1,
        label: "Time"
    },
    countAxis = {
        width: 60,
        label: "Count"
    }
}: CompositeHistogramVisualizationProps) {

    const { parentRef, width, height } = useParentSize();

    const innerWidth = useMemo(() => width - margins.left - margins.right, [width, margins.left, margins.right])
    const innerHeight = useMemo(() => height - margins.top - margins.bottom, [height, margins.top, margins.bottom])

    // Data Processing
    const maximumCount = useMemo(() => {
        const activeBins = visualizationData.bins.filter(
            (bin) => bin.processed.vehicleCounts.cumulative > 0
        )

        const max = Math.max(...activeBins.map((bin) => bin.processed.vehicleCounts.cumulative))

        const adjustedMax = (max * .05) + max

        return Math.max(10, adjustedMax)
    }, [visualizationData])

    const datums = useMemo(
        () =>
            visualizationData.bins.map((b): SummaryDatum => ({
                time: new Date(b.start).toISOString(),
                car: b.processed.vehicleCounts['car'],
                truck: b.processed.vehicleCounts['truck'],
                motorcycle: b.processed.vehicleCounts['motorcycle'],
                unknown: b.processed.vehicleCounts['unknown']
            }))
        , [visualizationData.bins])

    // Structural Artifcats 
    const histogramDimensions = useMemo(() => {

        const hgHeight = innerHeight - dateAxis.height;
        let hgWidth = 0;


        if (widthSizing === 'fit') {
            hgWidth = innerWidth - countAxis.width - margins.left
        } else {
            hgWidth = datums.length * dateAxis.mininumBinWidth

            if (hgWidth < innerWidth) hgWidth = innerWidth - countAxis.width - margins.left 
        }

        return {
            width: hgWidth,
            height: hgHeight
        }
    }, [innerWidth, innerHeight, widthSizing, dateAxis.height, countAxis.width, dateAxis.mininumBinWidth, datums.length])

    // Scales
    const countScale = useMemo(() =>
        scaleLinear({
            domain: [0, maximumCount],
            range: [histogramDimensions.height, 0],
        })
        , [maximumCount, histogramDimensions.height])

    const dateScale = useMemo(() =>
        scaleBand({
            domain: [...datums.map((d) => d.time)],
            range: [0, histogramDimensions.width],
            paddingInner: dateAxis.dateGapRatio,
        })
        , [datums, histogramDimensions.width, dateAxis.dateGapRatio])


    const typeScale = useMemo(() =>
        scaleBand({
            domain: [...VEHICLE_KEYS],
            range: [0, dateScale.bandwidth()],
            paddingInner: dateAxis.typeGapRatio
        })
        , [dateScale, dateAxis.typeGapRatio])

    const typeColorOrdinal = useMemo(() =>
        scaleOrdinal({
            domain: [...VEHICLE_KEYS],
            range: [...VEHICLE_KEY_COLORS]
        })
        , [])

    const visualizationDimensions = useMemo(() => {
        const vizWidth = margins.left + countAxis.width + histogramDimensions.width + margins.right
        const vizHeight = height

        return {
            width: vizWidth,
            height: vizHeight
        }
    }, [height, histogramDimensions.width, margins.left, margins.right])

    const dateAxisTickCount = useMemo(() => {
        if (dateAxis.ticksCount === undefined && widthSizing === 'fit') {
            if (visualizationDimensions.width < 200 && datums.length < 10) return 2;  
            else if (visualizationDimensions.width < 400 && datums.length < 10) return 4
            else if (visualizationDimensions.width < 600 && datums.length < 10) return datums.length / 4
            else return 5
        } 
        else return undefined;
    }, [dateAxis.ticksCount, widthSizing, visualizationDimensions.width, datums.length])

    return (
        <div ref={parentRef} className='w-full h-full'>
            {height > 0 && width > 0 && (
                <svg width={visualizationDimensions.width} height={visualizationDimensions.height}>
                    {/* Histogram Columns and Rows*/}
                    <Group left={margins.left + countAxis.width} top={margins.top}>
                        <GridRows
                            scale={countScale}
                            width={histogramDimensions.width}
                            stroke='oklch(92.2% 0 0)'
                            strokeDasharray='4'
                        />
                        <GridColumns
                            scale={dateScale}
                            height={histogramDimensions.height}
                            stroke='oklch(92.2% 0 0)'
                            numTicks={datums.length}
                        />
                    </Group>
                    {/* Histogram Axis*/}
                    <Group left={margins.left + countAxis.width} top={margins.top}>
                        <AxisLeft
                            scale={countScale}
                            labelOffset={countAxis.labelOffset || 40}
                            numTicks={countAxis.ticksCount}
                            hideTicks
                            tickLength={10}
                            hideAxisLine
                            label={countAxis.label}
                            tickStroke='oklch(92.2% 0 0)'
                            tickLabelProps={() => ({
                                textAnchor: 'end',
                                dy: '0.30em',
                                fontWeight: 600,
                                fontSize: "0.6rem",
                                fill: 'oklch(55.6% 0 0)',
                                ...countAxis.tickLabelStyling
                            })}
                            labelProps={{
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                ...countAxis.labelStyling
                            }}
                        />
                        <AxisBottom
                            top={histogramDimensions.height}
                            scale={dateScale}
                            labelOffset={dateAxis.labelOffset || 20}
                            numTicks={dateAxis.ticksCount || dateAxisTickCount}
                            tickLength={10}
                            label={dateAxis.label}
                            stroke='oklch(92.2% 0 0)'
                            tickStroke='oklch(92.2% 0 0)'
                            tickLabelProps={() => ({
                                textAnchor: 'middle',
                                dy: '0.30em',
                                fontWeight: 600,
                                fontSize: "0.6rem",
                                fill: "oklch(55.6% 0 0)",
                                ...dateAxis.tickLabelStyling
                            })}
                            labelProps={{
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                ...dateAxis.labelStyling
                            }}
                            tickFormat={(v) => dateAxis.tickFormatter ? dateAxis.tickFormatter(v) : v}
                        />
                    </Group>
                    {/* Histogram Visualization*/}
                    <Group top={margins.top} left={margins.left + countAxis.width}>
                        <BarGroup<SummaryDatum, VehicleKey>
                            data={datums}
                            height={histogramDimensions.height}
                            keys={[...VEHICLE_KEYS]}
                            x0={(d) => d.time}
                            x0Scale={dateScale}
                            x1Scale={typeScale}
                            yScale={countScale}
                            color={typeColorOrdinal}
                        >
                            {(barGroups) =>
                                barGroups.map((barGroup) => (
                                    <Group key={`bar-group-${barGroup.index}-${barGroup.x0}`} left={barGroup.x0}>
                                        {barGroup.bars.map((bar) => (
                                            <Group key={`bar-group-${barGroup.index}-${bar.index}`}>
                                                <Bar
                                                    x={bar.x}
                                                    y={bar.y}
                                                    width={bar.width}
                                                    height={bar.height}
                                                    fill={bar.color}
                                                    shapeRendering='crispEdges'
                                                />
                                                {(widthSizing === "content") && (
                                                    <Text
                                                        x={bar.x + 5}
                                                        y={bar.y + bar.width / 2}
                                                        textAnchor="start"
                                                        verticalAnchor='middle'
                                                        transform={`rotate(-90, ${bar.x}, ${bar.y})`}
                                                        style={{
                                                            fontSize: 11,
                                                            fill: 'oklch(55.6% 0 0)',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {bar.value.toLocaleString()}
                                                    </Text>
                                                )}
                                            </Group>
                                        ))}
                                    </Group>
                                ))
                            }
                        </BarGroup>
                    </Group>
                </svg>
            )}
        </div>
    )
}