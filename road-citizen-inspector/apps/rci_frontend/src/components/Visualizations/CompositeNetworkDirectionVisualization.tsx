import { useMemo } from "react";
import VisualizationSummary from "../VisualizationSummary";
import DirectionRadarVisualization, { RADAR_DIRECTIONS } from "./DirectionRadarVisualization/DirectionRadarVisualization";
import DirectionRadarSummary from "./DirectionRadarVisualization/DirectionRadarSummary";
import type { DirectionDatum } from "./DirectionRadarVisualization/DirectionRadarVisualization";
import type { CompositeVisualizationData } from "@road-citizen-inspector/visualization";

export type CompositeNetworkDirectionVisualization = {
    data: CompositeVisualizationData;
}
export default function CompositeNetworkDirectionVisualization({
    data
}: CompositeNetworkDirectionVisualization) {

    const compositeDirectionDatum = useMemo<DirectionDatum>(() => {
        return RADAR_DIRECTIONS.reduce((acc, direction) => {
            acc[direction] = data.bins.reduce(
                (sum, bin) => sum + bin.processed.directionCounts[direction].cumulative,
                0
            );
            return acc;
        }, {} as DirectionDatum);
    }, [data]);


    return (
        <VisualizationSummary title="Network Direction" description="Learn about dominant directions of your traffic network. View the totals of selected devices across the traffic network.">
            <div className="w-full gap-5 justify-around items-center flex flex-col @md:flex-row @md:justify-between h-full">
                <DirectionRadarSummary datum={compositeDirectionDatum} />
                <div>
                    <div className="size-[200px]">
                        <DirectionRadarVisualization
                            datum={compositeDirectionDatum}
                        />
                    </div>
                </div>
            </div>
        </VisualizationSummary>
    )

}