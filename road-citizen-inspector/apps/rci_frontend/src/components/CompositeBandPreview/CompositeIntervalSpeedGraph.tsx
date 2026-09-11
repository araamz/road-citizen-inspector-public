import { useMemo } from "react";
import VisualizationBandSection from "../VisualizationBandPreview/VisualizationBandSection";
import TemporalHeatmapLegend from "../Visualizations/TemporalHeatmapVisualization/TemporalHeatmapLegend";
import TemporalHeatmapVisualization from "../Visualizations/TemporalHeatmapVisualization/TemporalHeatmapVisualization";
import VisualizationChiclet from "../Chiclet/VisualizationChiclet";
import type { TemporalHeatmapDatum } from "../Visualizations/TemporalHeatmapVisualization/TemporalHeatmapVisualization";
import type { ReadingData } from "@road-citizen-inspector/contracts";
import type { CompositeBin } from "@road-citizen-inspector/visualization";

const DIRECTIONS = [
    "north",
    "northeast",
    "east",
    "southeast",
    "south",
    "southwest",
    "west",
    "northwest"
] as const

type DirectionKey = typeof DIRECTIONS[number]

export type CompositeIntervalSpeedGraphProps = {
    vehicleAvgSpeedSummary: CompositeBin['processed']['avgSpeedSummary']
    readings: Array<ReadingData>;
    start: Date;
    end: Date;
}
export default function CompositeIntervalSpeedGraph({
    vehicleAvgSpeedSummary,
    readings,
    start,
    end
}: CompositeIntervalSpeedGraphProps) {


    // The assumption is that the readings are already pre-sorted
    const minuteBins = useMemo(() => {
        if (readings.length === 0) return [];

        const startMs = start.getTime();
        const endMs = end.getTime() - 60_000;

        const minuteMs = 60_000;
        const binsCount = Math.floor((endMs - startMs) / minuteMs) + 1;

        const bins = Array.from({ length: binsCount }, (_, idx) => ({
            date: new Date(startMs + idx * minuteMs),
            readings: [] as typeof readings,
        }));

        for (const reading of readings) {
            const readingMs = new Date(reading.vehicle_detection_time).getTime();
            const binIdx = Math.floor((readingMs - startMs) / minuteMs);

            if (binIdx >= 0 && binIdx < bins.length) {
                bins[binIdx].readings.push(reading);
            }
        }

        return bins;
    }, [readings]);

    // NOTE: These datums are minute-by-minute based.
    const avgSpeedDatums = useMemo(() => {

        const emptyDirectionMagnitudes = Object.fromEntries(
            DIRECTIONS.map((dir) => [dir, [] as Array<number>])
        )

        const avgDirectionSpeeds = minuteBins.map((b) => {
            const directionSpeeds = b.readings.reduce((acc, r) => {
                acc[r.vehicle_direction].push(r.vehicle_speed)
                return acc;
            }, emptyDirectionMagnitudes) as Record<DirectionKey, Array<number>>

            const directionCumulativeSpeed = Object.fromEntries(
                Object.entries(directionSpeeds).map(([dir, speeds]) =>
                    [dir, speeds.reduce((acc, speed) => acc += speed, 0)]
                )
            )

            const directionSpeedAverages = Object.fromEntries(
                DIRECTIONS.map((dir) => {
                    let avg = Math.floor(directionCumulativeSpeed[dir] / directionSpeeds[dir].length)

                    if (isNaN(avg)) avg = 0;

                    return [dir, avg]
                })
            )

            return {
                date: b.date,
                directionSpeedAverages
            }

        })

        return avgDirectionSpeeds.map(({ date, directionSpeedAverages }): TemporalHeatmapDatum<DirectionKey> => {
            const magnitudes = DIRECTIONS.map((dir): TemporalHeatmapDatum<DirectionKey>['magnitudes'][number] => ({
                key: dir,
                value: directionSpeedAverages[dir]
            }))

            return {
                date: date,
                magnitudes
            }

        })

    }, [readings, start, end])

    const directionSummary = useMemo(() =>
        Object.entries(vehicleAvgSpeedSummary).map(([direction, breakdown]) => {
            const formattedDirection = direction.charAt(0).toUpperCase() + direction.slice(1);

            return {
                direction: formattedDirection,
                avgSpeed: breakdown.cumulative
            }
        })
        , [vehicleAvgSpeedSummary])

    const formatDate = (isoDate: string) => {
        const d = new Date(isoDate)
        const hour = String(d.getHours() % 12).padStart(2, '0')
        const minute = String(d.getMinutes()).padStart(2, '0')

        const ampm = () => {
            if (d.getHours() > 12) return 'pm'
            else return 'am'
        }


        return `${hour}:${minute} ${ampm().toUpperCase()}`
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

    const speedPreviewMetadata = useMemo(() => {
        const nonEmptyAverages = Object.entries(vehicleAvgSpeedSummary)
            .filter(([, breakdown]) => breakdown.cumulative > 0)
            .map(([dirString, breakdown]) => {
                const direction = DIRECTIONS.find((dir) => dir === dirString)

                if (!direction) throw new Error(`Direction is unknown. Failed to create speedPreviewMetadata. ${direction} !== ${dirString}`)

                return {
                    direction,
                    avgSpeed: breakdown.cumulative
                }
            })


        return nonEmptyAverages.reduce((acc, { direction, avgSpeed }) => {

            if (acc.min.avgSpeed > avgSpeed) {
                acc.min.avgSpeed = avgSpeed
                acc.min.direction = direction
            }

            if (acc.max.avgSpeed < avgSpeed) {
                acc.max.avgSpeed = avgSpeed
                acc.max.direction = direction
            }

            return acc;
        }, {
            min: {
                direction: nonEmptyAverages[0].direction,
                avgSpeed: nonEmptyAverages[0].avgSpeed
            },
            max: {
                direction: nonEmptyAverages[0].direction,
                avgSpeed: nonEmptyAverages[0].avgSpeed
            }
        })

    }, [vehicleAvgSpeedSummary])

    const SpeedPreview = () => (
        <div className="w-max flex flex-row gap-1.5 items-center">
            <div className="flex flex-col items-center">
                <p className="text-xs text-neutral-400 font-medium">
                    MIN
                </p>
                <p className="text-sm font-medium">
                    {speedPreviewMetadata.min.avgSpeed} MPH
                </p>
                <p className="text-xs tracking-wider">
                    {formatMagnitude(speedPreviewMetadata.min.direction)}
                </p>
            </div>
            <p className="text-4xl">
                &middot;
            </p>
            <div className="flex flex-col items-center">
                <p className="text-xs text-neutral-400 font-medium">
                    MAX
                </p>
                <p className="text-sm font-medium">
                    {speedPreviewMetadata.max.avgSpeed} MPH
                </p>
                <p className="text-xs tracking-wider">
                    {formatMagnitude(speedPreviewMetadata.max.direction)}
                </p>
            </div>
        </div>
    )

    const statusMessage = () => (
        `Average Vehicle Speed Range: ${speedPreviewMetadata.min.avgSpeed} MPH - ${speedPreviewMetadata.max.avgSpeed} MPH.`
    )

    return (
        <VisualizationBandSection
            label="Speed Graph"
            description="View the average speed of the vehicles moving across the transportation network within the time interval."
            preview={{
                thumbnail: <SpeedPreview />,
                status: statusMessage()
            }}
        >
            <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-5">
                    {directionSummary.map(({ direction, avgSpeed }, idx) =>
                        <VisualizationChiclet
                            key={`composite-interval-sped-graph-visualization-chiclet-${idx}`}
                            label={direction}
                        >
                            <>
                                {avgSpeed.toLocaleString()} MPH
                            </>
                        </VisualizationChiclet>
                    )}
                </div>
                <div className="flex flex-col gap-5">
                    <TemporalHeatmapVisualization
                        title='composite-interval-speed-graph'
                        datums={avgSpeedDatums}
                        glyphTicksCount={5}
                        showGlyphValue
                        dateAxis={{
                            height: 50,
                            ticksCount: avgSpeedDatums.length,
                            tickFormatter: (dStr) => formatDate(dStr)
                        }}
                        magnitudeAxis={{
                            width: 30,
                            tickFormatter: (mStr) => formatMagnitude(mStr)
                        }}
                    />
                    <TemporalHeatmapLegend ticksCount={5} label="Speed (mph)" datums={avgSpeedDatums} />
                </div>
            </div>
        </VisualizationBandSection>
    )
}