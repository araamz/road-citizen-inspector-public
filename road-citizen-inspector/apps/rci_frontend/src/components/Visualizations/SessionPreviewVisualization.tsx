import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParentSize } from "@visx/responsive";

import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { Group } from "@visx/group";
import { BarStack } from "@visx/shape";
import { GridColumns, GridRows } from "@visx/grid";
import DisabledCover from "../DisabledCover";
import { VEHICLE_KEYS } from "./CompositeHistogramVisualization/CompositeHistogramVisualization";
import type { VehicleKey } from "@/constants";
import { VEHICLE_TYPES, VEHILCE_KEY_COLORS } from "@/constants";
import UseSessionPreviewVisualizationOptions from "@/hooks/queries/visualization/UseSessionPreviewVisualizationOptions";
import useDateFormatter from "@/hooks/utilities/useDateFormatter";

type SessionPreviewDatum = {
    time: string;
} & Record<VehicleKey, number>
export type SessionPreviewVisualizationProps = {
    sessionId: number
    intervalCount?: number;
    margins?: {
        top: number,
        bottom: number,
        left: number,
        right: number
    }
}
export default function SessionPreviewVisualization({
    sessionId,
    intervalCount = 4,
    margins = {
        top: 10,
        bottom: 15,
        left: 0,
        right: 0
    },
}: SessionPreviewVisualizationProps) {

    const {
        parentRef,
        width,
        height
    } = useParentSize()

    const { renderHourly } = useDateFormatter()

    // Data Processing
    const visualizationTimestamps = useMemo(() => {
        const hourMs = 60 * 60 * 1000;

        const end = new Date();
        end.setMinutes(0, 0, 0);
        const start = new Date(end.getTime() - intervalCount * hourMs);

        return { start, end };
    }, [intervalCount]);

    const { data: visualizationData, isPending: visualizationPending, error: visualizationError } = useQuery(
        UseSessionPreviewVisualizationOptions(sessionId, {
            visualizationStart: visualizationTimestamps.start,
            visualizationEnd: visualizationTimestamps.end,
            intervalDurationMinutes: 60
        })
    )

    const maximumCount = useMemo(() => {
        if (!visualizationData) return 0
        const binMaxes = visualizationData.bins.map((b) => {
            const max = Object.entries(b.processed).reduce((acc, [, count]) => {
                return Math.max(acc, count);
            }, 0)

            return max;
        })

        return Math.max(...binMaxes)
    }, [visualizationData])

    const datums = useMemo(() => {
        if (!visualizationData) return []

        return visualizationData.bins.map((bin): SessionPreviewDatum => {
            const counts = bin.processed

            return {
                time: new Date(bin.start).toISOString(),
                car: counts['car'],
                truck: counts['truck'],
                motorcycle: counts['motorcycle'],
                unknown: counts['unknown']
            }
        })
    }, [visualizationData])

    // Structural Artifacts
    const innerWidth = useMemo(() => width - margins.left - margins.right, [width, margins.left, margins.right])
    const innerHeight = useMemo(() => height - margins.top - margins.bottom, [height, margins.top, margins.bottom])

    const dateAxisHeight = 10
    const countAxisWidth = 40

    const barstackDimensions = useMemo(() => {

        const bsHeight = innerHeight - dateAxisHeight
        const bsWidth = innerWidth - countAxisWidth

        return {
            width: bsWidth,
            height: bsHeight
        }
    }, [innerHeight, innerWidth, dateAxisHeight, countAxisWidth])


    // Scales
    const dateScale = useMemo(() =>
        scaleBand({
            domain: [...datums.map((d) => d.time)],
            range: [0, barstackDimensions.width],
            paddingInner: 0.5,
            paddingOuter: 0.25
        })
        , [datums, barstackDimensions.width])

    const countsScale = useMemo(() =>
        scaleLinear({
            domain: [0, maximumCount],
            range: [barstackDimensions.height, 0]
        })
        , [maximumCount, barstackDimensions.height])

    const vehicleTypeColors = useMemo(() =>
        scaleOrdinal({
            domain: [...VEHICLE_TYPES],
            range: [...VEHILCE_KEY_COLORS]
        })
        , [])

    const coverMessage = useMemo(() => {

        if (visualizationPending) return (
            <DisabledCover type='loading'>
                Loading recent session activity.
            </DisabledCover>
        )

        if (visualizationError) return (
            <DisabledCover type='warning'>
                An error occurred generating session preview. {visualizationError.message}
            </DisabledCover>
        )


        if (maximumCount === 0) return (
            <DisabledCover type="information">
                There was no session activity in the past {String(intervalCount)} hour{intervalCount > 1 ? 's' : ''}.
            </DisabledCover>
        )

        return undefined

    }, [visualizationError, visualizationPending, maximumCount, intervalCount])

    return (
        <div ref={parentRef} className="w-full h-full">
            {
                coverMessage !== undefined ? coverMessage : width > 0 && height > 0 && (
                    <svg width={width} height={height}>
                        <Group top={margins.top} left={margins.left}>
                            <GridRows
                                scale={countsScale}
                                width={barstackDimensions.width}
                                left={countAxisWidth}
                                strokeDasharray="4"
                                stroke='oklch(92.2% 0 0)'
                                tickValues={[0, maximumCount, Math.floor(maximumCount / 2)]}
                            />
                            <GridColumns
                                scale={dateScale}
                                height={barstackDimensions.height}
                                left={countAxisWidth}
                                stroke='oklch(92.2% 0 0)'
                            />
                        </Group>
                        <Group top={margins.top} left={margins.left}>
                            <AxisLeft
                                left={countAxisWidth}
                                scale={countsScale}
                                tickValues={[0, maximumCount, Math.floor(maximumCount / 2)]}
                                hideAxisLine
                                hideTicks
                                tickLength={5}

                                tickStroke='oklch(92.2% 0 0)'
                                tickLabelProps={() => ({
                                    textAnchor: 'end',
                                    dy: '0.30em',
                                    fontWeight: 600,
                                    fontSize: "0.6rem",
                                    fill: 'oklch(55.6% 0 0)',
                                })}
                            />
                            <AxisBottom
                                left={countAxisWidth}
                                top={barstackDimensions.height}
                                scale={dateScale}
                                numTicks={intervalCount}
                                tickFormat={(d) => renderHourly(new Date(d))}
                                hideAxisLine
                                tickLength={5}

                                tickStroke='oklch(92.2% 0 0)'
                                tickLabelProps={() => ({
                                    textAnchor: 'middle',
                                    dy: '0.30em',
                                    fontWeight: 600,
                                    fontSize: "0.6rem",
                                    fill: "oklch(55.6% 0 0)",
                                })}
                            />
                        </Group>
                        <Group top={margins.top} left={margins.left + countAxisWidth}>
                            <BarStack<SessionPreviewDatum, VehicleKey>
                                data={datums}
                                keys={[...VEHICLE_KEYS]}
                                x={(d) => d.time}
                                xScale={dateScale}
                                yScale={countsScale}
                                color={vehicleTypeColors}
                            >
                                {(barStacks) =>
                                    barStacks.map((barStack) => (
                                        barStack.bars.map((bar) =>
                                            <rect
                                                key={`session-preview-${sessionId}-bar-stack-${barStack.index}-${bar.index}`}
                                                x={bar.x}
                                                y={bar.y}
                                                height={bar.height}
                                                width={bar.width}
                                                fill={bar.color}
                                            />
                                        )
                                    ))
                                }
                            </BarStack>
                        </Group>
                    </svg>
                )
            }
        </div>
    )

}
