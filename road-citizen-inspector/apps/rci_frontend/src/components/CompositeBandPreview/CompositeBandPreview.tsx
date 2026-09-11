import VisualizationBandItem from "../VisualizationBandPreview/VisualizationBandItem"
import IntervalContributionVisualization from "../Visualizations/IntervalContributionVisualization"
import CompositeIntervalDeviceContribution from "./CompositeIntervalDeviceContribution/CompositeIntervalDeviceContribution"
import CompositeIntervalDirectionGraph from "./CompositeIntervalDirectionGraph"
import CompositeIntervalSpeedGraph from "./CompositeIntervalSpeedGraph"
import CompositeIntervalVehicleComposition from "./CompositeIntervalVehicleComposition/CompositeIntervalVehicleComposition"
import type { CompositeBin } from "@road-citizen-inspector/visualization"

export type CompositeBandPreviewProps = {
    data: CompositeBin
    maxVehicleCount: number
    showDay?: boolean;
}
export default function CompositeBandPreview({
    data,
    maxVehicleCount,
    showDay
}: CompositeBandPreviewProps) {

    if (!data.data) throw new Error("Missing data readings.")

    const formattedIntervalDates = () => {

        let start = undefined;
        if (showDay) {
            start = new Date(data.start).toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                hour12: true,
                minute: '2-digit',
                hour: '2-digit'
            })
        } else {
            start = new Date(data.start).toLocaleString('en-US', {
                hour12: true,
                minute: '2-digit',
                hour: '2-digit'
            })
        }

        const end = new Date(data.end).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })

        return {
            start,
            end
        }
    }

    return (
        <VisualizationBandItem
            disabled={data.processed.vehicleCounts.cumulative === 0}
            disabledReason={`No vehicle activity recorded between ${formattedIntervalDates().start} and ${formattedIntervalDates().end}. Try another time range or adjust your filters.`}
            label={`${formattedIntervalDates().start} - ${formattedIntervalDates().end}`}
            previewSlot={<IntervalContributionVisualization max={maxVehicleCount === 0 ? 1 : maxVehicleCount} min={0} value={data.processed.vehicleCounts.cumulative} />}
        >
            <CompositeIntervalDeviceContribution
                contributionBin={data.processed.contributionCounts}
                binVehicleCount={data.processed.vehicleCounts.cumulative}
            />
            <CompositeIntervalDirectionGraph
                vehicleDirectionCounts={data.processed.directionCounts}
                binVehicleCount={data.processed.vehicleCounts.cumulative}
            />
            <CompositeIntervalSpeedGraph
                vehicleAvgSpeedSummary={data.processed.avgSpeedSummary}
                readings={data.data}
                start={new Date(data.start)}
                end={new Date(data.end)}
            />
            <CompositeIntervalVehicleComposition
                vehicleCounts={data.processed.vehicleCounts}
                binVehicleCount={data.processed.vehicleCounts.cumulative}
            />
        </VisualizationBandItem>
    )
}