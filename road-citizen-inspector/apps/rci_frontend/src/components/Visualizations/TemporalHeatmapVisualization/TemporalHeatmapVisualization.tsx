import { AxisLeft, AxisTop } from "@visx/axis"
import { Group } from "@visx/group"
import { HeatmapRect } from "@visx/heatmap"
import { useParentSize } from "@visx/responsive"
import { scaleBand, scaleLinear } from "@visx/scale"
import { Text  } from "@visx/text"
import { Fragment, useMemo } from "react"
import type {TextProps} from "@visx/text";

export type TemporalHeatmapDatum<TMagnitudeKey extends string = string> = {
    date: Date
    magnitudes: Array<{
        key: TMagnitudeKey,
        value: number
    }>
}

export type TemporalHeatmapVisualizationProps<TMagnitudeKey extends string, TMagnitudeValues extends string> = {
    title: string,
    datums: Array<TemporalHeatmapDatum<TMagnitudeKey>>
    glyphGap?: number,
    glyphSize?: number,
    glyphRadius?: number,
    glyphTicksCount?: number,
    glyphValueText?: Pick<TextProps, "fontSize" | "fontWeight" | "fill" | "fillOpacity">,
    showGlyphValue?: boolean;
    glpyhColors?: {
        base: string
        min: string
        max: string;
    },
    margins?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    }
    magnitudeAxis?: {
        width: number;
        ticksCount?: number
        tickFormatter?: (value: TMagnitudeKey) => TMagnitudeValues;
    }
    dateAxis?: {
        height: number;
        tickStyle?: 'normal' | 'slant';
        ticksCount?: number
        tickFormatter?: (isoString: string) => string;
    }
}

export default function TemporalHeatmapVisualization<TMagnitudeKey extends string, TMagnitudeValues extends string>({
    title,
    datums,
    glyphGap = 5,
    glyphSize = 20,
    glyphRadius = 5,
    glyphTicksCount = undefined,
    glpyhColors = {
        base: 'oklch(97% 0 0)',
        min: 'oklch(97% 0 0)',
        max: 'oklch(85.2% 0.199 91.936)',
    },
    glyphValueText,
    showGlyphValue,
    margins = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    magnitudeAxis = {
        width: 60,
    },
    dateAxis = {
        height: 60,
        tickStyle: 'slant'
    }
}: TemporalHeatmapVisualizationProps<TMagnitudeKey, TMagnitudeValues>) {

    const { width, height, parentRef } = useParentSize()

    // Heatmap Semantics
    const dateColumns = useMemo(() =>
        datums.map((d) => d.date.toISOString())
        , [datums])

    const magnitudeRows = useMemo(() =>
        datums.reduce<Array<TMagnitudeKey>>((acc, d) => {
            const magnitudeKeys = d.magnitudes.map(({ key }) => key)

            const missingKeys = magnitudeKeys.filter((k) => !acc.includes(k))

            return [...acc, ...missingKeys]
        }, [])
        , [datums])

    const maxMagnitudeValue = useMemo(() =>
        datums.reduce((acc, d) => {
            const datumValues = d.magnitudes.map(({ value }) => value)
            const maxDatumValue = Math.max(...datumValues)

            return Math.max(acc, maxDatumValue)
        }, 0)
        , [datums])

    // Rendering Artifcats
    const innerWidth = useMemo(() => width - margins.left - margins.right
        , [width, margins.left, margins.right])

    const innerHeight = useMemo(() => height - margins.top - margins.bottom
        , [height, margins.top, margins.bottom])

    const heatmapDimensions = useMemo(() => {
        const glyphStep = glyphSize + glyphGap
        const hWidth = glyphStep * dateColumns.length;
        const hHeight = glyphStep * magnitudeRows.length;

        return {
            width: hWidth,
            height: hHeight,
        }
    }, [glyphSize, glyphGap, dateColumns, magnitudeRows])


    const visualizationDimensions = useMemo(() => {
        const vWidth = magnitudeAxis.width + heatmapDimensions.width
        const vHeight = dateAxis.height + heatmapDimensions.height

        return {
            width: vWidth,
            height: vHeight,
        }
    }, [magnitudeAxis.width, dateAxis.height, heatmapDimensions.width, heatmapDimensions.height])

    const fillerDimensions = useMemo(() => {
        const rWidth = Math.max(0, innerWidth - visualizationDimensions.width - glyphGap)
        const rHeight = heatmapDimensions.height

        return {
            width: rWidth,
            height: rHeight,
        }
    }, [innerWidth, visualizationDimensions.width, glyphGap, heatmapDimensions.height])

    // Scales
    const dateScale = useMemo(() =>
        scaleBand({
            domain: [...dateColumns],
            range: [0, heatmapDimensions.width],
            paddingInner: glyphGap / (glyphSize + glyphGap)
        })
        , [dateColumns, heatmapDimensions.width, glyphGap, glyphSize])

    const magnitudeScale = useMemo(() =>
        scaleBand({
            domain: [...magnitudeRows],
            range: [heatmapDimensions.height, 0],
            paddingInner: glyphGap / (glyphSize + glyphGap)
        })
        , [magnitudeRows, heatmapDimensions.height, glyphGap, glyphSize])

    const magnitudeColorScale = useMemo(() =>
        scaleLinear({
            domain: [0, maxMagnitudeValue],
            range: [glpyhColors.min, glpyhColors.max],
            nice: glyphTicksCount ? glyphTicksCount : undefined
        })
        , [maxMagnitudeValue, glyphTicksCount, glpyhColors.min, glpyhColors.max])

    // Accessors 
    const dateAccessor = (dateIdx: number) => {
        const x = dateScale(dateColumns[dateIdx])
        if (x === undefined) throw Error(`Data for heatmap rendering malformed. Date Accessor can't access index: ${dateIdx}`)
        return x;
    }

    const magnitudeAccessor = (magnitudeIdx: number) => {
        const y = magnitudeScale(magnitudeRows[magnitudeIdx])
        if (y === undefined) throw Error(`Data for heatmap rendering malformed. Magnitude Accessor can't access index: ${magnitudeIdx}`)
        return y;
    }

    const countAccessor = (magnitude: TemporalHeatmapDatum<TMagnitudeKey>['magnitudes'][number]) => {
        const count = magnitude.value
        return count;
    }

    return (
        <div ref={parentRef} className="h-min w-full overflow-auto overscroll-x-none">
            <svg width={visualizationDimensions.width > innerWidth ? visualizationDimensions.width : innerWidth} height={visualizationDimensions.height > innerHeight ? visualizationDimensions.height : innerHeight}>
                <Group top={margins.top} left={margins.left}>
                    <AxisTop
                        top={dateAxis.height}
                        scale={dateScale}
                        left={magnitudeAxis.width}
                        hideAxisLine
                        hideTicks
                        tickLength={dateAxis.tickStyle === 'normal' ? 5 : 0}
                        tickLabelProps={{
                            angle: dateAxis.tickStyle === 'normal' ? 0 : -90,
                            fontWeight: 600,
                            textAnchor: dateAxis.tickStyle === 'normal' ? 'middle' : 'start',
                            verticalAnchor: dateAxis.tickStyle === 'normal' ? 'start' : 'middle',
                            fontSize: "0.6rem",
                            fill: "oklch(55.6% 0 0)",
                        }}
                        numTicks={dateAxis.ticksCount}
                        tickFormat={(v) => dateAxis.tickFormatter ? dateAxis.tickFormatter(v) : v}
                    />
                    <AxisLeft
                        top={dateAxis.height}
                        left={magnitudeAxis.width}
                        scale={magnitudeScale}
                        hideAxisLine
                        hideTicks
                        tickLength={5}
                        tickLabelProps={{
                            fontWeight: 600,
                            fontSize: "0.6rem",
                            fill: "oklch(55.6% 0 0)"
                        }}
                        numTicks={magnitudeAxis.ticksCount}
                        tickFormat={(v) => magnitudeAxis.tickFormatter ? magnitudeAxis.tickFormatter(v) : v}
                    />
                </Group>
                <Group top={margins.top + dateAxis.height} left={margins.left + magnitudeAxis.width}>
                    <HeatmapRect<TemporalHeatmapDatum<TMagnitudeKey>, TemporalHeatmapDatum<TMagnitudeKey>['magnitudes'][number]>
                        data={datums}
                        bins={(d) => d.magnitudes}
                        xScale={dateAccessor}
                        yScale={magnitudeAccessor}
                        count={countAccessor}
                        binWidth={glyphSize}
                        binHeight={glyphSize}
                        gap={0}
                        colorScale={(v) => magnitudeColorScale(v)}
                    >
                        {(heatmap) =>
                            heatmap.map((bins, binsIdx) => (
                                bins.map((bin, binIdx) =>
                                    <Fragment key={`${title}-heapmap-rect-${binsIdx}-${binIdx}`}>
                                        <rect
                                            width={bin.width}
                                            height={bin.height}
                                            x={bin.x}
                                            y={bin.y}
                                            cx={bin.x}
                                            cy={bin.y}
                                            rx={glyphRadius}
                                            ry={glyphRadius}
                                            fill={maxMagnitudeValue === 0 ? glpyhColors.base : bin.color}
                                            opacity={bin.opacity}
                                        />
                                        {
                                            showGlyphValue && bin.bin.value > 0 && (
                                                <Text
                                                    x={bin.x + (glyphSize / 2)}
                                                    y={bin.y + (glyphSize / 2)}
                                                    textAnchor="middle"
                                                    verticalAnchor="middle"
                                                    fontSize={8}
                                                    fillOpacity={0.5}
                                                    fontWeight={500}
                                                    {...glyphValueText}
                                                >
                                                    {bin.bin.value}
                                                </Text>
                                            )
                                        }
                                    </Fragment>
                                )
                            ))
                        }
                    </HeatmapRect>
                </Group>
                <Group left={margins.left + visualizationDimensions.width + glyphGap} top={margins.top + dateAxis.height}>
                    <rect
                        width={fillerDimensions.width}
                        height={fillerDimensions.height}
                        fill="oklch(96.5% 0 0)"
                        rx={glyphRadius}
                        ry={glyphRadius}
                    />
                    {fillerDimensions.width > 100 && (
                        <Text
                            x={fillerDimensions.width / 2}
                            y={fillerDimensions.height / 2}
                            textAnchor="middle"
                            verticalAnchor="middle"
                            fontWeight={400}
                            fontSize={12}
                            fill="oklch(70.8% 0 0)"
                            width={100}
                        >
                            No Data
                        </Text>
                    )}
                </Group>
            </svg>
        </div>
    )
}