import { useMemo } from "react";
import VisualizationSummary from "../../VisualizationSummary";
import TemporalHeatmapVisualization from "../TemporalHeatmapVisualization/TemporalHeatmapVisualization";
import TemporalHeatmapLegend from "../TemporalHeatmapVisualization/TemporalHeatmapLegend";
import type { CompositeVisualizationData } from "@road-citizen-inspector/visualization"
import type { TemporalHeatmapDatum } from "../TemporalHeatmapVisualization/TemporalHeatmapVisualization";
import VisualizationChiclet from "@/components/Chiclet/VisualizationChiclet";

const VEHICLE_DIRECTIONS = [
    "northwest",
    "west",
    "southwest",
    "south",
    "southeast",
    "east",
    "northeast",
    "north"
] as const;
type DirectionKey = typeof VEHICLE_DIRECTIONS[number]

const DIRECTION_ABBREVIATIONS = [
    "NW",
    "W",
    "SW",
    "S",
    "SE",
    "E",
    "NE",
    "N"
] as const
export type DirectionAbbreviationKey = typeof DIRECTION_ABBREVIATIONS[number]

export type CompositeNetworkSpeedGraphVisualizationProps = {
    data: CompositeVisualizationData;
}
export default function CompositeNetworkSpeedGraphVisualization({
    data
}: CompositeNetworkSpeedGraphVisualizationProps) {

    const speedDatums = useMemo(
        () =>
            data.bins.map((bin): TemporalHeatmapDatum<DirectionKey> => {
                const magnitudes = VEHICLE_DIRECTIONS.map((direction) => ({
                    key: direction,
                    value: bin.processed.avgSpeedSummary[direction].cumulative,
                }));

                return {
                    date: new Date(bin.start),
                    magnitudes,
                };
            }),
        [data]
    );

    const processedData = useMemo(() => {

        const directionAccumulator = Object.fromEntries(VEHICLE_DIRECTIONS.map((direction) =>
            [direction, [] as Array<number>]
        ))

        return data.bins.reduce((acc, bin) => {

            VEHICLE_DIRECTIONS.forEach((direction) => {

                const avg = bin.processed.avgSpeedSummary[direction].cumulative

                if (avg === 0) return acc;
                else acc[direction].push(avg)
            })

            return acc;
        }, directionAccumulator)
    }, [data])


    const directionAverages = useMemo(() =>
        Object.fromEntries(VEHICLE_DIRECTIONS.map((direction) => {
            const directionSummation = processedData[direction].reduce((acc, avg) => acc += avg, 0)

            const avgsCount = processedData[direction].length
            if (avgsCount === 0) return [direction, 0]

            const directionAverage = directionSummation / avgsCount

            return [direction, directionAverage]
        })) as Record<DirectionKey, number>
        , [processedData])


    const networkAverage = useMemo(() => {
        const networkAverages = VEHICLE_DIRECTIONS.reduce((acc, direction) => {
            const avg = directionAverages[direction]
            if (avg === 0) return acc;
            else acc.push(avg)
            return acc;
        }, [] as Array<number>)

        const averageSummation = networkAverages.reduce((acc, avg) => acc += avg, 0)
        const averagesCount = networkAverages.length
        const average = (averageSummation/averagesCount) || 0

        return average
    }, [directionAverages])

    const mapDirectionAbbreviation = (direction: DirectionKey): DirectionAbbreviationKey => {
        switch (direction) {
            case 'north': {
                return 'N'
            }
            case 'northeast': {
                return 'NE'
            }
            case 'east': {
                return 'E'
            }
            case 'southeast': {
                return 'SE'
            }
            case 'south': {
                return 'S'
            }
            case 'southwest': {
                return 'SW'
            }
            case 'west': {
                return 'W'
            }
            case 'northwest': {
                return 'NW'
            }
        }
    }

    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate)
        const pad = (n: number) => n.toString().padStart(2, "0");

        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());

        let hours = date.getHours();
        const minutes = pad(date.getMinutes());
        // const seconds = pad(date.getSeconds());

        const ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12;
        if (hours === 0) hours = 12; // midnight/noon fix

        return `${month}/${day}, ${pad(hours)}:${minutes} ${ampm}`;
    };

    return (
        <VisualizationSummary
            title="Network Speed"
            description="Track how average vehicle speeds change over time across directions in your network."
        >
            <div className="@container w-full">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-10 items-center @lg:flex-row @lg:justify-around">
                        <div className="flex items-center flex-col w-full @md:max-w-fit">
                            <p className="text-neutral-400 tracking-wider font-medium uppercase text-xs text-nowrap">
                                Average Speed
                            </p>
                            <div className="flex">
                                <p className="text-6xl">
                                    {Math.floor(networkAverage)}
                                </p>
                                <p className="font-medium leading-tight text-sm self-baseline-last">
                                    MPH
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5 @md:grid-cols-3 w-full @lg:max-w-[500px]">
                            {
                                Object.entries(directionAverages).map(([d, avg], idx) =>
                                    <VisualizationChiclet key={`network-avg-speed-direction-${idx}`} label={d}>
                                        <>
                                            {Math.floor(avg)} MPH
                                        </>
                                    </VisualizationChiclet>
                                )
                            }
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col max-w-full gap-5 items-center w-full overflow-auto ">
                        <TemporalHeatmapVisualization<DirectionKey, DirectionAbbreviationKey>
                            title="network-temporal-heatmap"
                            datums={speedDatums}
                            magnitudeAxis={{
                                width: 30,
                                tickFormatter: (v) => mapDirectionAbbreviation(v)
                            }}
                            dateAxis={{
                                height: 80,
                                ticksCount: (speedDatums.length / 2),
                                tickFormatter: (d) => formatDate(d)
                            }}
                        />
                        <TemporalHeatmapLegend 
                            label="Speed (mph)"
                            datums={speedDatums}
                            ticksCount={5}
                        />
                    </div>

                </div>
            </div>
        </VisualizationSummary>
    )
}   