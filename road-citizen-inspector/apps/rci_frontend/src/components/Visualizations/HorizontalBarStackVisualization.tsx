import { BarStackHorizontal } from "@visx/shape";
import { useParentSize } from "@visx/responsive";
import { useMemo } from "react";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridColumns } from "@visx/grid";

export type HorizontalBarStackDatum<TBarKey extends string, TValueKey extends string> = {
    datumKey: TBarKey;
} & Record<TValueKey, number>
export type HorizontalBarStackVisualizationProps<
    TBarKey extends string,
    TValueKey extends string
> = {
    title: string
    valueKeys: Array<{
        key: TValueKey
        color: string
    }>
    datums: Array<HorizontalBarStackDatum<TBarKey, TValueKey>>
    margins?: {
        left: number
        right: number
        top: number
        bottom: number
    }
    bandAxis?: {
        axisOffset?: number
        labelOffset?: number
        label?: string
        width: number
        formatter?: (lane: TBarKey) => string
    }
    countsAxis?: {
        axisOffset?: number
        labelOffset?: number
        tickOffset?: number
        label?: string
        height: number
        showGrid?: boolean
    }
    totalCount: number
}

export default function HorizontalBarStackVisualization<
    TBarKey extends string,
    TValueKey extends string
>({
    title,
    valueKeys,
    datums,
    totalCount,
    margins = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    bandAxis = {
        width: 40,
    },
    countsAxis = {
        height: 30,
        showGrid: true
    }
}: HorizontalBarStackVisualizationProps<TBarKey, TValueKey>) {
    const { width, height, parentRef } = useParentSize()

    // Structural Artifacts
    const innerWidth = useMemo(
        () => Math.max(0, width - margins.left - margins.right),
        [width, margins.left, margins.right]
    )

    const innerHeight = useMemo(
        () => Math.max(0, height - margins.top - margins.bottom),
        [height, margins.top, margins.bottom]
    )

    const metadata = useMemo(() => {
        const keys = valueKeys.map((key) => key.key)
        const colors = valueKeys.map((value) => value.color)

        return { keys, colors }
    }, [valueKeys])

    const barstackDimensions = useMemo(() => {
        return {
            width: Math.max(0, innerWidth - bandAxis.width),
            height: Math.max(0, innerHeight - countsAxis.height)
        }
    }, [innerWidth, innerHeight, bandAxis.width, countsAxis.height])

    // Scales
    const bandScale = useMemo(
        () =>
            scaleBand<TBarKey>({
                domain: datums.map((d) => d.datumKey),
                range: [0, barstackDimensions.height],
                padding: 0.2,
            }),
        [datums, barstackDimensions.height]
    )

    const bandColorScale = useMemo(
        () =>
            scaleOrdinal<TValueKey, string>({
                domain: metadata.keys,
                range: metadata.colors
            }),
        [metadata]
    )

    const countsScale = useMemo(
        () =>
            scaleLinear({
                domain: [0, Math.max(1, totalCount)],
                range: [0, barstackDimensions.width],
                nice: true
            }),
        [totalCount, barstackDimensions.width]
    )

    return (
        <div ref={parentRef} className="size-full">
            <svg width={width} height={height}>
                <Group left={margins.left + bandAxis.width}>
                    {countsAxis.showGrid ? (
                        <GridColumns
                            height={barstackDimensions.height}
                            scale={countsScale}
                            stroke="oklch(92.2% 0 0)"
                            strokeDasharray="4"
                            numTicks={countsScale.ticks().length / 2}

                        />
                    ) : undefined
                    }
                </Group>
                <Group left={margins.left + bandAxis.width} top={margins.top}>
                    {bandAxis.width > 0 && (
                        <AxisLeft
                            scale={bandScale}
                            tickFormat={bandAxis.formatter}
                            tickLabelProps={{
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                fill: "oklch(55.6% 0 0)"
                            }}
                            hideAxisLine
                            hideTicks
                        />
                    )}
                    {countsAxis.height > 0 && (
                        <AxisBottom
                            top={barstackDimensions.height}
                            scale={countsScale}
                            tickLabelProps={{
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                fill: "oklch(55.6% 0 0)"
                            }}
                            tickStroke="oklch(92.2% 0 0)"
                            labelProps={{
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                fill: 'oklch(55.6% 0 0)'
                            }}
                            tickLength={countsAxis.tickOffset ?? 0}
                            numTicks={countsScale.ticks().length / 2}
                            hideAxisLine
                            labelOffset={countsAxis.labelOffset ?? 0}
                            label={countsAxis.label}
                        />
                    )}
                    <BarStackHorizontal<HorizontalBarStackDatum<TBarKey, TValueKey>, TValueKey>
                        keys={metadata.keys}
                        y={(d) => d.datumKey}
                        data={datums}
                        yScale={bandScale}
                        xScale={countsScale}
                        color={bandColorScale}
                    >
                        {(barStacks) =>
                            barStacks.map((barStack) =>
                                barStack.bars.map((bar) => (
                                    <rect
                                        key={`${title}-barstack-horizontal-${barStack.index}-${bar.index}`}
                                        x={bar.x}
                                        y={bar.y}
                                        width={bar.width}
                                        height={bar.height}
                                        fill={bar.color}
                                    />
                                ))
                            )
                        }
                    </BarStackHorizontal>
                </Group>
            </svg>
        </div>
    )
}