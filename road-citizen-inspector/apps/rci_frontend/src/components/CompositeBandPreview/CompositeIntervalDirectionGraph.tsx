import { useMemo } from "react";
import DirectionRadarVisualization, { RADAR_DIRECTIONS } from "../Visualizations/DirectionRadarVisualization/DirectionRadarVisualization";
import DirectionRadarSummary from "../Visualizations/DirectionRadarVisualization/DirectionRadarSummary";
import type { CompositeBin } from "@road-citizen-inspector/visualization";
import VisualizationBandSection from "@/components/VisualizationBandPreview/VisualizationBandSection";

export type CompositeIntervalDirectionGraphProps = {
    vehicleDirectionCounts: CompositeBin['processed']['directionCounts']
    binVehicleCount: number;
}
export default function CompositeIntervalDirectionGraph({
    vehicleDirectionCounts
}: CompositeIntervalDirectionGraphProps) {

    const directionDatums = useMemo(() => {
        const directionArray = RADAR_DIRECTIONS.map((direction) => {
            const count = vehicleDirectionCounts[direction].cumulative
            return [direction, count]
        })

        return Object.fromEntries(directionArray)
    }, [vehicleDirectionCounts])

    const previewMetadata = useMemo(() => {
        const sortedDatums = Object.entries(directionDatums as Record<string, number>).sort((a, b) => b[1] - a[1])
        const [direction, count] = sortedDatums[0]

        const formattedDirection = direction.charAt(0).toUpperCase() + direction.slice(1)

        return {
            direction: formattedDirection,
            count
        }
    }, [directionDatums])

    const DirectionPreview = () => (
        <div className="size-16">
            <DirectionRadarVisualization
                datum={directionDatums}
                cardinalAxis={{
                    visible: false
                }}
                levelAxis={{
                    visible: false
                }}
                margins={{
                    top: 5,
                    bottom: 5,
                    left: 5,
                    right: 5
                }}
            />
        </div>
    )

    const statusMessage = () => (
        `Top Direction: ${previewMetadata.direction} - ${previewMetadata.count} Vehicles`
    )

    return (
        <VisualizationBandSection
            label="Direction Graph"
            description="View the direction of vehicles through the transportation network within a interval."
            preview={{
                thumbnail: <DirectionPreview />,
                status: statusMessage()
            }}
        >
            <div className="
                flex flex-col gap-5 items-center
                @md:flex @md:flex-row
            ">
                <div>
                    <div className="size-36">
                        <DirectionRadarVisualization datum={directionDatums} />
                    </div>
                </div>
                <DirectionRadarSummary datum={directionDatums} />
            </div>
        </VisualizationBandSection>
    )
}
