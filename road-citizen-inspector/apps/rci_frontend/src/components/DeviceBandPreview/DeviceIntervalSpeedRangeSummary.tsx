import { useMemo } from "react";
import _ from "lodash";
import VisualizationBandSection from "../VisualizationBandPreview/VisualizationBandSection";
import TemporalHeatmapVisualization from "../Visualizations/TemporalHeatmapVisualization/TemporalHeatmapVisualization";
import TemporalHeatmapLegend from "../Visualizations/TemporalHeatmapVisualization/TemporalHeatmapLegend";
import VisualizationChiclet from "../Chiclet/VisualizationChiclet";
import { VEHICLE_KEYS } from "../Visualizations/CompositeHistogramVisualization/CompositeHistogramVisualization";
import type { DeviceBin } from "@road-citizen-inspector/visualization";
import type { TemporalHeatmapDatum } from "../Visualizations/TemporalHeatmapVisualization/TemporalHeatmapVisualization";
import type {DirectionKey, RoadTypeKey} from "@/constants";
import useDateFormatter from "@/hooks/utilities/useDateFormatter";

export type DeviceIntervalSpeedRangeSummaryProps = {
    speedRangeSummary: DeviceBin['processed']['speedRangeSummary']
    avgSpeedSummary: DeviceBin['processed']['avgSpeedSummary']
    deviceConfiguration?: {
        roadType: RoadTypeKey,
        primaryDirection: DirectionKey,
        secondaryDirection: DirectionKey | null
    },
    status?: 'ready' | 'loading' | 'disabled'
}
export default function DeviceIntervalSpeedRangeSummaryProps({
    speedRangeSummary,
    avgSpeedSummary,
    deviceConfiguration,
    status = 'ready'
}: DeviceIntervalSpeedRangeSummaryProps) {

    const { renderHourly } = useDateFormatter()

    // Data Processing
    const heatmapDatums = useMemo(() =>
        speedRangeSummary.map((s): TemporalHeatmapDatum => {

            // NOTE: Process te array of ranges to make dictionary of key-value (key: rangeValue, value: cummulativeCount)
            // NOTE: The speed ranges are reversed such that the ranges start from slowest speed ranges to fastest speed ranges.
            const rangeMagntiudes = s.speedRanges.reverse().map((rangeData) => ({
                key: String(rangeData.index),
                value: rangeData.breakdown.cumulative
            }))

            return {
                date: new Date(s.minuteTimestamp),
                magnitudes: rangeMagntiudes
            }

        })
        , [speedRangeSummary])

    const topSpeedRange = useMemo(() => {

        const speedRanges = speedRangeSummary.map((s) => s.speedRanges)

        // NOTE: Get the indexes with the most vehicle counts and return the index value.
        const prominentSpeedRangeBins = speedRanges.map((sr) => sr.reduce((acc, srd) => {
            if (acc.breakdown.cumulative < srd.breakdown.cumulative) return srd
            return acc;
        }, sr[0]))

        const indexGroups = _.groupBy(prominentSpeedRangeBins, (srd) => srd.index)

        const mostFrequentGroup = _.maxBy(
            Object.entries(indexGroups),
            ([_, group]) => group.length
        )

        const mostFrequentIndex = mostFrequentGroup
            ? {
                index: mostFrequentGroup[1][0].index,
                minMph: mostFrequentGroup[1][0].minMph,
                maxMph: mostFrequentGroup[1][0].maxMph
            }
            : undefined

        return mostFrequentIndex
    }, [speedRangeSummary])

    const rangeLabels = useMemo(() => {

        // NOTE: The assumption is that the speed range magnitudes do not change.

        const modelBin = speedRangeSummary[0]

        return modelBin.speedRanges.map((sr) => ({
            index: String(sr.index),
            label: `${sr.minMph} - ${sr.maxMph} MPH`
        }))

    }, [speedRangeSummary])

    const formatRangeTick = (indexStr: string) => {
        const rangeTick = rangeLabels.find((rl) => rl.index === indexStr)?.label

        return rangeTick ? rangeTick : String(indexStr)
    }

    const formatMagnitude = (direction: DirectionKey) => {
        if (direction === 'north') return 'N'
        if (direction === 'northeast') return 'NE'
        if (direction === 'east') return 'E'
        if (direction === 'southeast') return 'SE'
        if (direction === 'south') return 'S'
        if (direction === 'southwest') return 'SW'
        if (direction === 'west') return 'W'
        return 'NW'
    }

    const SpeedPreview = ({
        primaryDirection,
        secondaryDirection
    }: {
        primaryDirection: DirectionKey,
        secondaryDirection?: DirectionKey | null
    }) => (
        <div className="w-max flex flex-row gap-1.5 items-center">
            <div className="flex flex-col items-center">
                <p className="text-sm font-medium">
                    {avgSpeedSummary[primaryDirection].cumulative} MPH
                </p>
                <p className="text-xs tracking-wider">
                    {formatMagnitude(primaryDirection)}
                </p>
            </div>
            {secondaryDirection ? (
                <>
                    <p className="text-4xl">
                        &middot;
                    </p>
                    <div className="flex flex-col items-center">
                        <p className="text-sm font-medium">
                            {avgSpeedSummary[secondaryDirection].cumulative} MPH
                        </p>
                        <p className="text-xs tracking-wider">
                            {formatMagnitude(secondaryDirection)}
                        </p>
                    </div>
                </>
            ) : undefined}
        </div>
    )

    const statusMessage = useMemo(() => {

        if (!topSpeedRange) return `Top speed range is unavailable.`
        const { minMph, maxMph } = topSpeedRange;

        const minMphText = `${minMph} MPH`
        const maxMphText = `${maxMph} MPH`

        return `Top Speed Range: ${minMphText} - ${maxMphText}`

    }, [topSpeedRange])

    const AverageDirectionSummary = ({
        direction
    }: {
        direction: DirectionKey
    }) => (
        <div className="w-full @container">
            <div className="
                w-full
                flex flex-col items-center gap-5 
                @xs:flex-row @xs:justify-around
            ">
                <div className="flex flex-col items-center">
                    <p className="text-sm text-amber-600 tracking-wider font-medium">
                        Average Speed
                    </p>
                    <p className="text-lg font-medium">
                        {avgSpeedSummary[direction].cumulative} MPH
                    </p>
                    <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                        {direction}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                    {VEHICLE_KEYS.map((vt, idx) =>
                        <VisualizationChiclet 
                            key={`device-interval-speed-range-summary-${idx}`}
                            label={vt}
                        >
                            <>
                                {avgSpeedSummary[direction][vt]} MPH
                            </>
                        </VisualizationChiclet>
                    )}
                </div>

            </div>
        </div>
    )


    return (
        <VisualizationBandSection
            label="Speed Range Summary"
            description="View the average speed of vehicles and the most frequently observed speed range at this location."
            loading={status === 'ready' ? false : true}
            preview={{
                thumbnail: <SpeedPreview primaryDirection={deviceConfiguration!.primaryDirection} secondaryDirection={deviceConfiguration?.secondaryDirection} />,
                status: statusMessage
            }}
        >
            <div className="flex flex-col gap-5">
                <div className="flex flex-col @md:*:flex-1 gap-5">
                    {deviceConfiguration?.primaryDirection && <AverageDirectionSummary direction={deviceConfiguration.primaryDirection} />}
                    {deviceConfiguration?.secondaryDirection && <AverageDirectionSummary direction={deviceConfiguration.secondaryDirection} />}
                </div>
                <div className="flex flex-col gap-5">
                    <TemporalHeatmapVisualization
                        title='composite-interval-speed-graph'
                        datums={heatmapDatums}
                        glyphTicksCount={5}
                        showGlyphValue
                        dateAxis={{
                            height: 55,
                            tickFormatter: (isoDate) => renderHourly(new Date(isoDate)),
                            ticksCount: 60
                        }}
                        magnitudeAxis={{
                            width: 70,
                            tickFormatter: (speedRangeIndex: string) => formatRangeTick(speedRangeIndex)
                        }}
                    />
                    <TemporalHeatmapLegend ticksCount={5} label="Vehicle Count" datums={heatmapDatums} />
                </div>
            </div>
        </VisualizationBandSection>
    )
}