import { FaCompass } from "react-icons/fa6"
import type { LaneGroup } from "@/components/Visualizations/LaneGraphVisualization"
import type { DirectionKey } from "@/constants"
import Badge from "@/components/Badge"
import LaneGraphVisualization from "@/components/Visualizations/LaneGraphVisualization"

export type LaneGroupVisualizationProps = {
    data: LaneGroup
    maxVehicleCount: number;
    direction: DirectionKey
    type: "primary" | "secondary"
}
export default function LaneGroupVisualization({
    data,
    maxVehicleCount,
    direction,
    type
}: LaneGroupVisualizationProps) {

    const directionMaxCount = Object.entries(data).reduce((acc, [,br]) => acc += br.cumulative, 0)

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col w-full gap-y-1.5 @sm:flex-row gap-x-2.5">
                    <Badge size="sm" label={direction.toUpperCase()} icon={FaCompass} />
                    <p className="font-medium tracking-wider text-sm leading-tight">
                        {type === "primary" ? "Primary Direction" : "Secondary Direction"}
                    </p>
                </div>
                <p className="text-sm text-neutral-500 font-medium text-nowrap">
                    {directionMaxCount} Vehicles
                </p>
            </div>
            <div className="w-full h-40">
                <LaneGraphVisualization laneCounts={data} binVehicleCount={maxVehicleCount} />
            </div>
        </div>
    )
}