import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import VisualizationBandSection from "../../VisualizationBandPreview/VisualizationBandSection";
import LaneGraphVisualization from "../../Visualizations/LaneGraphVisualization";
import LaneCountsSummary from "./LaneCountsSummary";
import LaneGroupVisualization from "./LaneGroupVisualization";
import type { LaneCountsSummaryProps } from "./LaneCountsSummary";
import type { LaneGroup } from "../../Visualizations/LaneGraphVisualization";
import type { DeviceBin } from "@road-citizen-inspector/visualization";
import type { LaneStrKey, RoadTypeKey } from "@/constants";
import useDeviceConfigurationOptions from "@/hooks/queries/device/UseDeviceConfigurationOptions";
import { DIRECTIONS, LANES_STR, ROAD_TYPES, VEHICLE_TYPES, VEHILCE_KEY_COLORS } from "@/constants";
import ColorGlyph from "@/components/Visualizations/ColorGlyph";

const ROAD_TYPE_LANES: Record<
    RoadTypeKey,
    { primary: ReadonlyArray<LaneStrKey>; secondary: ReadonlyArray<LaneStrKey> | null }
> = {
    sdsl: { primary: ["1"], secondary: null },
    sddl: { primary: ["1", "2"], secondary: null },
    ddsl: { primary: ["1"], secondary: ["2"] },
    dddl: { primary: ["1", "2"], secondary: ["3", "4"] },
};

export type DeviceIntervalLaneGraphProps = {
    deviceId: number;
    laneCounts: DeviceBin['processed']['laneCounts']
    intervalStart: Date;
    intervalEnd: Date;
}
export default function DeviceIntervalLaneGraph({
    deviceId,
    laneCounts}: DeviceIntervalLaneGraphProps) {

    const { data: deviceConfiguration, isPending: configurationPending } = useQuery(
        useDeviceConfigurationOptions(deviceId)
    )

    function pickLanes(
        lanes: ReadonlyArray<LaneStrKey>,
    ): LaneGroup {
        return lanes.reduce<LaneGroup>((acc, lane) => {
            const breakdown = laneCounts[Number(lane)];
            acc[lane] = breakdown;
            return acc;
        }, {});
    }

    const processedLaneCounts = useMemo(() => {
        const config = deviceConfiguration?.configuration;
        if (!config) return null;

        const roadType = ROAD_TYPES.find((rt) => rt === deviceConfiguration.configuration?.road_type)

        if (!roadType) throw new Error("Failed to index Road Type for Device Lane Graph.")

        const laneConfig = ROAD_TYPE_LANES[roadType];

        return {
            primary: pickLanes(laneConfig.primary),
            secondary: laneConfig.secondary
                ? pickLanes(laneConfig.secondary)
                : null,
        };
    }, [deviceConfiguration]);

    const processedConfiguration = useMemo(() => {
        if (!deviceConfiguration?.configuration) return null;

        const config = deviceConfiguration.configuration;
        const roadType = ROAD_TYPES.find((rt) => rt === config.road_type)
        const primaryDirection = DIRECTIONS.find((dir) => dir === config.road_primary_direction)
        const secondaryDirection = DIRECTIONS.find((dir) => dir === config.road_secondary_direction)

        if (!roadType || !primaryDirection || !secondaryDirection) throw new Error("Failed to index device configuration.")

        return {
            roadType,
            primaryDirection,
            secondaryDirection
        }

    }, [deviceConfiguration])

    const maxLaneCount = Object.entries(laneCounts).reduce((acc, [, br]) => Math.max(acc, br.cumulative), 0)

    const legendItems = () => {
        return VEHICLE_TYPES.map((vt, idx) => ({
            type: vt,
            color: VEHILCE_KEY_COLORS[idx]
        }))
    }

    const laneCountSummaries = useMemo(() => {
        if (!processedConfiguration || !processedLaneCounts) return null;

        const primary = Object.entries(processedLaneCounts.primary).map(([lane, br]): LaneCountsSummaryProps => {

            const laneKey = LANES_STR.find((l) => l === lane)

            if (!laneKey) throw new Error("Failed to index the lane key for Device Lane Graph.")

            return {
                lane: laneKey,
                data: br,
                type: 'primary',
                direction: processedConfiguration.primaryDirection
            }
        })

        const secondary = processedLaneCounts.secondary ? Object.entries(processedLaneCounts.secondary).map(([lane, br]): LaneCountsSummaryProps => {

            const laneKey = LANES_STR.find((l) => l === lane)

            if (!laneKey) throw new Error("Failed to index the lane key for Device Lane Graph.")

            return {
                lane: laneKey,
                data: br,
                type: 'secondary',
                direction: processedConfiguration.primaryDirection
            }
        }) : null

        if (secondary) return [...primary, ...secondary]
        else return [...primary]

    }, [processedConfiguration, processedLaneCounts])

    const LaneGraphPreview = () => {

        const previewLaneCounts = useMemo(() => {

            const config = deviceConfiguration?.configuration;
            if (!config) return null;

            const roadType = ROAD_TYPES.find((rt) => rt === deviceConfiguration.configuration?.road_type)

            if (!roadType) throw new Error("Failed to index Road Type for Preview Lane Counts.")

            if (roadType === 'sdsl') return pickLanes(["1"])
            if (roadType === 'sddl' || roadType === 'ddsl') return pickLanes(["1", "2"])
            return laneCounts;

        }, [deviceConfiguration, laneCounts])

        return (
            <div className="h-10 w-20 bg-neutral-50 p-0.5 rounded-md">
                {previewLaneCounts ? (
                    <LaneGraphVisualization
                        laneCounts={previewLaneCounts}
                        binVehicleCount={maxLaneCount}
                        countsAxis={{
                            height: 0,
                            showGrid: false
                        }}
                        bandAxis={{
                            width: 0
                        }}
                        margins={{
                            left: 0,
                            right: 0,
                            bottom: 0,
                            top: 0
                        }}
                    />) : undefined}
            </div>
        )
    }

    const previewMessage = () => {
        const laneCumulativeCounts = Object.entries(laneCounts).map(([lane, br]) => [lane, br.cumulative]).map(([lane, count]) => ({
            lane,
            count
        }))

        const topLane = laneCumulativeCounts.reduce((acc, lane) => {
            if (acc.count < lane.count) return lane
            return acc;
        }, laneCumulativeCounts[0])

        return `Top Traversed Lane: Lane ${topLane.lane} - ${topLane.count} Vehicles`
    }

    return (
        <VisualizationBandSection
            loading={configurationPending}
            disabled={configurationPending}
            label="Lane Graph"
            description=""
            preview={{
                thumbnail: <LaneGraphPreview />,
                status: previewMessage()
            }}
        >
            <div className="flex flex-col gap-5">
                <div className="flex flex-row justify-evenly gap-2.5 flex-wrap">
                    {legendItems().map((item, idx) => (
                        <div key={`device-interval-lane-graph-legend-${idx}`} className="flex flex-row items-center gap-1.5">
                            <ColorGlyph color={item.color} size={15} />
                            <p className="text-sm tracking-wider font-medium">
                                {item.type.toUpperCase()}
                            </p>
                        </div>
                    ))}
                </div>
                <div>
                    {processedLaneCounts?.primary && processedConfiguration && (
                        <LaneGroupVisualization
                            type="primary"
                            data={processedLaneCounts.primary}
                            maxVehicleCount={maxLaneCount}
                            direction={processedConfiguration.primaryDirection}
                        />
                    )}
                    {processedLaneCounts?.secondary && processedConfiguration && (
                        <LaneGroupVisualization
                            type="secondary"
                            data={processedLaneCounts.secondary}
                            maxVehicleCount={maxLaneCount}
                            direction={processedConfiguration.secondaryDirection}
                        />
                    )}
                </div>
                <div className="flex flex-col gap-2.5">
                    {laneCountSummaries && laneCountSummaries.map((s, idx) =>
                        <LaneCountsSummary
                            key={`device-interval-lane-graph-count-summary-${idx}`}
                            {...s}
                        />
                    )}
                </div>
            </div>
        </VisualizationBandSection>
    )
}