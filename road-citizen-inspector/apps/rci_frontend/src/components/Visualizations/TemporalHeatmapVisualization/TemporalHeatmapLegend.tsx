import { scaleLinear } from "@visx/scale"
import { Fragment, useMemo } from "react"
import type { TemporalHeatmapDatum } from "./TemporalHeatmapVisualization"

export type TemporalHeatmapLegendProps<TMagnitudeKey extends string> = {
    label: string;
    datums: Array<TemporalHeatmapDatum<TMagnitudeKey>>
    glpyhColors?: {
        base: string
        min: string
        max: string;
    },
    ticksCount?: number,
    glyphSize?: number;
    glyphRadius?: number;
    glyphGap?: number;
    showGlyphValue?: boolean;
}
export default function TemporalHeatmapLegend<TMagnitudeKey extends string>({
    label,
    datums,
    glpyhColors = {
        base: 'oklch(97% 0 0)',
        min: 'oklch(97% 0 0)',
        max: 'oklch(85.2% 0.199 91.936)'
    },
    ticksCount = 5,
    glyphGap = 5,
    glyphSize = 20,
    glyphRadius = 5,
}: TemporalHeatmapLegendProps<TMagnitudeKey>) {

    // Structural Artifacts
    const maxMagnitudeValue = useMemo(() =>
        datums.reduce((dAcc, d) => {
            const datumMaxes = d.magnitudes.map((m) => m.value)
            return Math.max(dAcc, ...datumMaxes)
        }, 0)
        , [datums])

    const magnitudeColorScale = useMemo(
        () => scaleLinear({
            domain: [0, maxMagnitudeValue],
            range: [glpyhColors.min, glpyhColors.max],
            nice: ticksCount ? ticksCount : undefined
        })
        , [maxMagnitudeValue, glpyhColors.min, glpyhColors.max, ticksCount])


    const ticks = useMemo(() => {
        const tickValues = magnitudeColorScale.ticks(ticksCount).map((t) => {

            const value = t
            const color = magnitudeColorScale(t)

            return {
                value,
                color
            }
        })

        return tickValues
    }, [magnitudeColorScale, ticksCount])

    // Rendering Artifacts
    const legendDimensions = useMemo(() => {
        const glyphStep = glyphSize + glyphGap
        const lWidth = glyphStep * ticks.length;

        return {
            width: lWidth,
            height: glyphSize
        }
    }, [glyphGap, glyphSize, ticks.length])

    const tickPositions = useMemo(() => {
        const glyphStep = glyphSize + glyphGap;

        return ticks.map((t, idx) => ({
            tick: t,
            x: idx * glyphStep,
            y: 0
        }))
    }, [ticks, glyphGap, glyphSize])

    if (maxMagnitudeValue === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-1.5 items-center">
            <div className="flex flex-row gap-2.5 items-center w-fit">
                <p className="text-sm font-medium">
                    {ticks[0].value}
                </p>
                <svg width={legendDimensions.width - glyphGap} height={legendDimensions.height}>
                    {
                        tickPositions.map((t, idx) =>
                            <Fragment key={`${label}-legend-${idx}`}>
                                <rect
                                    x={t.x}
                                    y={t.y}
                                    fill={t.tick.color}
                                    width={glyphSize}
                                    height={glyphSize}
                                    rx={glyphRadius}
                                    ry={glyphRadius}
                                />
                            </Fragment>
                        )
                    }
                </svg>
                <p className="text-sm font-medium">
                    {ticks[ticks.length - 1].value}
                </p>
            </div>
            <p className="text-xs font-medium">
                {label}
            </p>
        </div>
    )
}