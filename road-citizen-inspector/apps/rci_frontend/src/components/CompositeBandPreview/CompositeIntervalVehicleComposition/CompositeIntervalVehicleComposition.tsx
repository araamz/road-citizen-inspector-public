import { useMemo } from "react";
import VisualizationBandSection from "../../VisualizationBandPreview/VisualizationBandSection";
import PieChartVisualization from "../../Visualizations/PieChartVisualization/PieChartVisualization";
import type { CompositeBin } from "@road-citizen-inspector/visualization";
import IntervalVehicleItem, { type IntervalVehicleItemProps } from "@/components/IntervalVehicleItem";

const VEHILCE_KEY_COLORS: Array<string> = ["#f39c12", "#27ae60", "#c0392b", "#2c3e50"] as const
const VEHICLE_TYPES = ["car", "motorcycle", "truck", "unknown"] as const

export type CompositeIntervalVehicleCompositionProps = {
    vehicleCounts: CompositeBin['processed']['vehicleCounts']
    binVehicleCount: number;
}
export default function CompositeIntervalVehicleComposition({
    vehicleCounts,
    binVehicleCount
}: CompositeIntervalVehicleCompositionProps) {

    const vehicleDatums = useMemo(
        () =>
            VEHICLE_TYPES.map((vt, idx) => ({
                color: VEHILCE_KEY_COLORS[idx],
                label: vt,
                value: vehicleCounts[vt]
            })),
        [vehicleCounts]
    )

    const legendItems = useMemo(
        (): Array<IntervalVehicleItemProps> => 
            VEHICLE_TYPES.map((vt, idx) => ({
                label: vt,
                color: VEHILCE_KEY_COLORS[idx],
                vehiclePercentage: (vehicleCounts[vt] / binVehicleCount) * 100,
                vehicleCount: vehicleCounts[vt]
            }))
    , [vehicleCounts, binVehicleCount])

    const previewMetadata = useMemo(() => {
        const vehicleTypes = Object.entries(vehicleCounts).filter(([value]) => value !== 'cumulative')
        const sortedTypes = vehicleTypes.sort((a, b) => b[1] - a[1])
        const [vehicleType, count] = sortedTypes[0]

        const formattedType = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)

        return {
            type: formattedType,
            count
        }
    }, [vehicleCounts])

    const CompostiionPreview = () => (
        <div className="size-10">
            <PieChartVisualization 
                datums={vehicleDatums} 
                padAngle={0.1}
                radiusPercentage={0.35}
            />
        </div>
    )

    const statusMessage = () => (
        `Top Vehicle Type: ${previewMetadata.type} - ${previewMetadata.count} Vehicles`
    )
    
    return (
        <VisualizationBandSection
            label="Vehicle Composition"
            description="View the type of vehicles that make up the activity in your transportation in an interval."
            preview={{
                thumbnail: <CompostiionPreview />,
                status: statusMessage()
            }}
        >
            <div className="
                flex flex-col gap-5
                items-center
            ">
                <div className="size-30">
                    <PieChartVisualization
                        datums={vehicleDatums}
                        centerText={binVehicleCount.toLocaleString()}
                        radiusPercentage={0.25}
                        centerTextStyling={{
                            fontSize: 10
                        }}
                    />
                </div>
                <div className="
                    w-full justify-between
                    flex gap-5 flex-wrap
                ">
                    {
                        legendItems.map((i, idx) => 
                            <IntervalVehicleItem key={`composite-interval-vehicle-item-${idx}`} {...i} />
                        )
                    }
                </div>
            </div>
        </VisualizationBandSection>
    )
}