import { useMemo } from "react";
import PieChartVisualization from "../PieChartVisualization/PieChartVisualization";
import PieChartLegend from "../PieChartVisualization/PieChartLegend";
import NetworkCompositionDataPoint from "./NetworkCompositionDataPoint";
import type { CompositeVisualizationData } from "@road-citizen-inspector/visualization"
import type { PieDatum } from "../PieChartVisualization/PieChartVisualization";
import VisualizationSummary from "@/components/VisualizationSummary";

const VEHICLE_TYPES = ["car", "motorcycle", "truck", "unknown"] as const
type VehicleTypeKey = typeof VEHICLE_TYPES[number]
export type NetworkVehicleCompositionVisualizationProps = {
    data?: CompositeVisualizationData;
}
export default function NetworkVehicleCompositionVisualization({
    data
}: NetworkVehicleCompositionVisualizationProps) {


    const vehicleTypeColor = (type: VehicleTypeKey) => {
        if (type === 'car') return '#f39c12'
        if (type === 'motorcycle') return '#27ae60'
        if (type === 'truck') return "#c0392b"
        return "#2c3e50"
    }

    const maxCount = useMemo(() => data?.bins.reduce((acc, bin) => acc += bin.processed.vehicleCounts.cumulative, 0) || 0, [data])

    const vehicleCountDatums = useMemo(() =>
        VEHICLE_TYPES.map((type): PieDatum => {

            const color = vehicleTypeColor(type);
            if (!data) {
                return {
                    label: type,
                    value: 0,
                    color
                };
            }

            return {
                label: type,
                value: data.bins.reduce((count, bin) => count += bin.processed.vehicleCounts[type], 0),
                color
            };
        })

        , [data])

    const vehiclePercentages = useMemo(() =>
        vehicleCountDatums.map((d) => ({
            ...d,
            percentage: maxCount !== 0 ? Math.ceil((d.value / maxCount) * 100) : 0
        })).sort((a, b) => b.value - a.value)
        , [maxCount])

    return (
        <VisualizationSummary title="Vehicle Composition" description="Learn about the vehicles types that make up the activity of your transportation network.">
            <div className="flex flex-col justify-around gap-10 h-full">
                <div className="grid grid-cols-2 gap-5">
                    {vehiclePercentages.map((d, idx) =>
                        <NetworkCompositionDataPoint
                            key={`vehicle-composition-summary-${idx}`}
                            vehicleType={d.label}
                            percentage={d.percentage}
                            count={d.value}
                        />
                    )}
                </div>
                <div className="w-full flex flex-col gap-5 items-center">
                    <div className="size-[180px]" >
                        <PieChartVisualization
                            showPlaceholder={maxCount === 0 ? true : false}
                            centerText={maxCount.toLocaleString()}
                            radiusPercentage={0.30}
                            datums={vehicleCountDatums}
                        />
                    </div>
                    <PieChartLegend datums={vehicleCountDatums} labelClassname="uppercase" />
                </div>
            </div>
        </VisualizationSummary>

    )
}