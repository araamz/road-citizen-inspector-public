import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import DisabledCover from "@/components/DisabledCover";
import DeviceHistogramVisualization from "@/components/Visualizations/DeviceHistogramVisualization";
import UseDeviceVisualizationOptions from "@/hooks/queries/visualization/UseDeviceVisualizationOptions";
import useDateFormatter from "@/hooks/utilities/useDateFormatter";

export type DeviceSummaryPreviewProps = {
    deviceId: number;
    intervalCountHrs?: number;
}
export default function DeviceSummaryPreview({
    deviceId,
    intervalCountHrs = 4
}: DeviceSummaryPreviewProps) {

    const { renderHourly } = useDateFormatter()

    const visualizationTimestamps = useMemo(() => {
        const hourMs = 60 * 60 * 1000;

        const end = new Date();
        end.setMinutes(0, 0, 0);
        const start = new Date(end.getTime() - intervalCountHrs * hourMs);

        return { start, end };
    }, [intervalCountHrs]);

    const { data: visualizationData, isPending: visualizationPending, error: visualizationError } = useQuery(
        UseDeviceVisualizationOptions(deviceId, {
            visualizationStart: visualizationTimestamps.start,
            visualizationEnd: visualizationTimestamps.end,
            intervalDurationMinutes: 60
        })
    )

    const maxCount = useMemo(() => {
        if (!visualizationData) return null;

        const cumulativeCounts = visualizationData.bins.map((bin) => bin.processed.vehicleCounts.cumulative)

        return Math.max(...cumulativeCounts)
    }, [visualizationData])

    if (visualizationPending) return (
        <DisabledCover type="loading">
            Loading recent device activity.
        </DisabledCover>
    )

    if (visualizationError) return (
        <DisabledCover type="warning">
            An error occurred generating device preview. {visualizationError.message}
        </DisabledCover>
    )

    if (maxCount === 0) return (
        <DisabledCover type="information">
            There was no device activity in the past {String(intervalCountHrs)} hour{intervalCountHrs > 1 ? 's' : ''}.
        </DisabledCover>
    )

    return (
        <DeviceHistogramVisualization
            data={visualizationData}
            visibilityEmphasis="counts"
            countsAxis={{
                width: 50,
                label: undefined,
                hideTicks: true,
                tickLength: 5
            }}
            percentageAxis={{
                width: 0
            }}
            timeAxis={{
                label: undefined,
                tickFormatter: (isoDateTime) => renderHourly(new Date(isoDateTime)),
                labelOffset: 0,
                height: 30
            }}
        />
    )
}