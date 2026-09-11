import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import VisualizationBandItem from "../VisualizationBandPreview/VisualizationBandItem";
import IntervalContributionVisualization from "../Visualizations/IntervalContributionVisualization";
import DeviceIntervalVehicleComposition from "./DeviceIntervalVehicleComposition";
import DeviceIntervalSpeedRangeSummaryProps from "./DeviceIntervalSpeedRangeSummary";
import DeviceIntervalDataSummary from "./DeviceIntervalDeviceSummary/DeviceIntervalDataSummary";
import DeviceIntervalLaneGraph from "./DeviceIntervalLaneGraph/DeviceIntervalLaneGraph";
import type { DeviceBin } from "@road-citizen-inspector/visualization";
import type { DeviceSearchParamsSchema } from "@/routes/session.$sessionId/_claimed/device/$deviceId";
import useDateFormatter from "@/hooks/utilities/useDateFormatter";
import useDeviceConfigurationOptions from "@/hooks/queries/device/UseDeviceConfigurationOptions";
import { DIRECTIONS, ROAD_TYPES } from "@/constants";

export type DeviceBandPreview = {
    deviceId: number;
    bin: DeviceBin;
    totalVehicleCount: number,
    showDay?: boolean;
    searchParams: DeviceSearchParamsSchema
}
export default function DeviceBandPreview({
    deviceId,
    bin,
    totalVehicleCount,
    showDay
}: DeviceBandPreview) {


    
    const {
        data: deviceConfiguration,
    } = useQuery(useDeviceConfigurationOptions(deviceId))

    const {
        renderDailyHourly,
        renderHourly
    } = useDateFormatter()

    const processedDeviceConfiguration = useMemo(() => {
        if (!deviceConfiguration) return undefined

        const roadType = ROAD_TYPES.find((rt) => rt === deviceConfiguration.configuration?.road_type)

        if (!roadType) throw new Error("Failed to index the road type for a Device Interval Band.")

        if (roadType === 'dddl' || roadType === 'ddsl') {
            const primaryDirection = DIRECTIONS.find((dir) => dir === deviceConfiguration.configuration?.road_primary_direction)
            const secondaryDirection = DIRECTIONS.find((dir) => dir === deviceConfiguration.configuration?.road_secondary_direction)

            if (!primaryDirection || !secondaryDirection) throw new Error("Failed to index the primary and secondary direction for a Device Interval Band.")

            return {
                roadType,
                primaryDirection,
                secondaryDirection
            }
        } else {
            const primaryDirection = DIRECTIONS.find((dir) => dir === deviceConfiguration.configuration?.road_primary_direction)

            if (!primaryDirection) throw new Error("Failed to index the primary direction for a Device Interval Band.")

            return {
                roadType,
                primaryDirection,
                secondaryDirection: null
            }

        }
    }, [deviceConfiguration])

    const readableLabel = useMemo(() => {

        const start = new Date(bin.start)

        if (showDay) {
            return renderDailyHourly(start)
        }

        return renderHourly(start)

    }, [showDay, renderDailyHourly, renderHourly])

    const formattedIntervalDates = () => {

        let start = undefined;
        if (showDay) {
            start = new Date(bin.start).toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                hour12: true,
                minute: '2-digit',
                hour: '2-digit'
            })
        } else {
            start = new Date(bin.start).toLocaleString('en-US', {
                hour12: true,
                minute: '2-digit',
                hour: '2-digit'
            })
        }

        const end = new Date(bin.end).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })

        return {
            start,
            end
        }
    }

    if (!bin.data) throw new Error("Device data sources are required for rendering Device Interval Speed Graph.")

    const binMaxCount = bin.processed.vehicleCounts.cumulative

    return (
        <VisualizationBandItem
            previewSlot={<IntervalContributionVisualization value={binMaxCount} min={0} max={totalVehicleCount} />}
            label={readableLabel}
            disabled={binMaxCount === 0}
            disabledReason={`No vehicle activity recorded between ${formattedIntervalDates().start} and ${formattedIntervalDates().end}. Try another time range or adjust your filters.`}
        >
            <DeviceIntervalDataSummary
                deviceId={deviceId}
                intervalStart={new Date(bin.start)}
                intervalEnd={new Date(bin.end)}
                data={bin['data']}
            />
            <DeviceIntervalSpeedRangeSummaryProps
                speedRangeSummary={bin['processed']['speedRangeSummary']}
                avgSpeedSummary={bin['processed']['avgSpeedSummary']}
                deviceConfiguration={processedDeviceConfiguration}
                status={deviceConfiguration ? 'ready' : 'loading'}
            />
            <DeviceIntervalVehicleComposition
                vehicleCounts={bin['processed']['vehicleCounts']}
                binVehicleCount={binMaxCount}
            />
            <DeviceIntervalLaneGraph
                deviceId={deviceId}
                intervalStart={new Date(bin.start)}
                intervalEnd={new Date(bin.end)}
                laneCounts={bin['processed']['laneCounts']}
            />
        </VisualizationBandItem>

    )
} 