// TODOS:yjuh 

// TODO 1: Fix Date - If more than day, show day otherwise hour.
// TODO 2: Bring Tick Formatter system to parity with this visualization.

// Visualization Rendering
import { useParentSize } from '@visx/responsive'
import { Line, Stack } from '@visx/shape';
import { curveBumpX, stack as d3stack, stackOffsetWiggle } from '@visx/vendor/d3-shape';

// React
import { useMemo } from "react";

// Types
import { scaleLinear, scaleOrdinal, scaleTime } from '@visx/scale';
import { AxisBottom } from '@visx/axis';
import { GridColumns } from '@visx/grid';
import { Group } from '@visx/group';
import { LegendItem, LegendLabel, LegendOrdinal } from '@visx/legend';
import type { CompositeBin, CompositeVisualizationData } from "@road-citizen-inspector/visualization"
import type { TCDF_VEHICLE_TYPE } from '@road-citizen-inspector/tcd-uplink-protocol';

export type CompositeThemeRiverVisualizationProps = {
    visualizationData: CompositeVisualizationData;
    margins?: {
        left: number,
        right: number,
        top: number,
        bottom: number
    },
    dateFormatter?: (isoDate: string) => string;
}

type StreamDatum = {
    time: Date;
    unknown: number,
    truck: number,
    motorcycle: number,
    car: number
    total: number;
}

// Constants
const legendGlyphSize = 10;
const bottomCurveGap = 5;

type VehicleKey = keyof Record<TCDF_VEHICLE_TYPE, number>
const vehicleKeys: Array<VehicleKey> = ["car", "motorcycle", "truck", "unknown"]
const vehicleKeysColors: Array<string> = ["#f39c12", "#27ae60", "#c0392b", "#2c3e50"]

export default function CompositeThemeRiverVisualization({
    visualizationData,
    margins = {
        left: 35,
        right: 35,
        top: 20,
        bottom: 50
    },
    dateFormatter
}: CompositeThemeRiverVisualizationProps) {

    const { parentRef, width, height } = useParentSize();

    const innerWidth = useMemo(() => width - margins.left - margins.right, [width, margins.left, margins.right])
    const innerHeight = useMemo(() => height - margins.top - margins.bottom, [height, margins.top, margins.bottom])

    const themesSummaryData = useMemo(() => {
        return visualizationData.bins.map((interval: CompositeBin): StreamDatum => {

            const counts = interval.processed.vehicleCounts;

            return {
                time: new Date(interval.start),
                car: counts['car'],
                truck: counts['truck'],
                motorcycle: counts['motorcycle'],
                unknown: counts['unknown'],
                total: counts['cumulative'],
            }
        })
    }, [visualizationData])

    const stackedData = useMemo(() => {
        const stackFunction = d3stack<StreamDatum, VehicleKey>()
            .keys(vehicleKeys)
            .offset(stackOffsetWiggle)
        return stackFunction(themesSummaryData);
    }, [themesSummaryData]);

    const countBounds = useMemo(() => {
        let min = 0;
        let max = 0;
        stackedData.forEach((series) => {
            series.forEach((d) => {
                if (d[0] < min) min = d[0];
                if (d[1] > max) max = d[1];
            });
        });
        return [min, max];
    }, [stackedData]);

    // accessors
    const countsScale = useMemo(() => scaleLinear({
        domain: [countBounds[0], countBounds[1]],
        range: [innerHeight - bottomCurveGap, 0 - bottomCurveGap],
        nice: true
    }), [innerHeight, countBounds]);

    const dateScale = useMemo(() => scaleTime({
        domain: [
            Math.min(...themesSummaryData.map(d => new Date(d.time).getTime())),
            Math.max(...themesSummaryData.map(d => new Date(d.time).getTime()))
        ],
        range: [0, innerWidth],
    }), [themesSummaryData, innerWidth]);

    const keysColors = useMemo(() => scaleOrdinal({
        domain: [...vehicleKeys],
        range: [...vehicleKeysColors]
    }), [])

    const getDate = (s: StreamDatum) => s.time

    const dateAxisTickCount = useMemo(() => {
        if (innerWidth < 200 && themesSummaryData.length < 10) return 2;
        else if (innerWidth < 400 && themesSummaryData.length < 10) return 4
        else if (innerWidth < 600 && themesSummaryData.length < 10) return themesSummaryData.length / 4
        else return 5
}, [innerWidth, themesSummaryData.length])


return (
    <div className='min-w-full min-h-full flex flex-col items-center justify-center'>
        <LegendOrdinal
            scale={keysColors}
            labelFormat={((label) => label.toUpperCase())}
        >
            {
                ((labels) => (
                    <div className='flex flex-row gap-4'>
                        {
                            labels.map((label, index) => {
                                return (
                                    <LegendItem key={`themeriver-legend-${index}`} className='flex flex-row gap-1.5'>
                                        <svg width={legendGlyphSize} height={legendGlyphSize}>
                                            <rect
                                                fill={label.value}
                                                cx={legendGlyphSize / 2}
                                                cy={legendGlyphSize / 2}
                                                width={legendGlyphSize}
                                                height={legendGlyphSize}
                                                rx={legendGlyphSize / 5}
                                                ry={legendGlyphSize / 5}
                                            />
                                        </svg>
                                        <LegendLabel className='text-xs font-medium'>
                                            {label.text}
                                        </LegendLabel>
                                    </LegendItem>
                                )
                            })
                        }
                    </div>
                ))
            }
        </LegendOrdinal>
        <div ref={parentRef} className='w-full h-full'>
            {width > 0 && height > 0 && (
                <svg width={width} height={height}>
                    <GridColumns
                        scale={dateScale}
                        width={innerWidth}
                        height={innerHeight}
                        top={margins.top}
                        left={margins.left}
                        numTicks={themesSummaryData.length}
                        stroke='oklch(92.2% 0 0)'
                    />
                    <Stack<StreamDatum, VehicleKey>
                        data={themesSummaryData}
                        keys={vehicleKeys}
                        offset='wiggle'
                        curve={curveBumpX}
                        color={keysColors}
                        top={margins.top}
                        left={margins.left}
                        x={(d) => dateScale(getDate(d.data))}
                        y0={(d) => countsScale(d[0])}
                        y1={(d) => countsScale(d[1])}
                    />
                    <AxisBottom
                        top={margins.top + innerHeight}
                        left={margins.left}
                        scale={dateScale}
                        labelOffset={25}
                        tickLength={10}
                        numTicks={dateAxisTickCount}
                        stroke='oklch(92.2% 0 0)'
                        tickStroke='oklch(92.2% 0 0)'
                        tickLabelProps={() => ({
                            textAnchor: 'middle',
                            dy: '0.30em',
                            fontWeight: 600,
                            fontSize: "0.6rem",
                            fill: "oklch(55.6% 0 0)",
                        })}
                        label='Time'
                        labelProps={{
                            fontWeight: 600,
                            fontSize: "0.7rem",
                        }}
                        tickFormat={(v) => v instanceof Date && dateFormatter ? dateFormatter(v.toISOString()) : new Date(Number(v)).toISOString()}
                    />
                    <Group left={margins.left} top={margins.top}>
                        {themesSummaryData.map((_, idx) => {
                            const bottomY = stackedData[0][idx][0];
                            const topY = stackedData[stackedData.length - 1][idx][1];

                            return (
                                <Line
                                    key={`stream-line-${idx}`}
                                    from={{
                                        x: dateScale(getDate(themesSummaryData[idx])),
                                        y: countsScale(bottomY)
                                    }}
                                    to={{
                                        x: dateScale(getDate(themesSummaryData[idx])),
                                        y: countsScale(topY)
                                    }}
                                    stroke='rgba(0,0,0,0.25)'
                                    strokeWidth={1}
                                    style={{ pointerEvents: 'none' }}
                                />
                            );
                        })}
                    </Group>
                </svg>
            )}
        </div>
    </div>
)
}