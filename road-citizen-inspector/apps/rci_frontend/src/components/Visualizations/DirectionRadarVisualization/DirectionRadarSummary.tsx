import { useMemo } from "react"
import {  RADAR_DIRECTIONS } from "./DirectionRadarVisualization"
import type {DirectionDatum} from "./DirectionRadarVisualization";
import VisualizationChiclet from "@/components/Chiclet/VisualizationChiclet"

export type DirectionRadarSummaryProps = {
    datum: DirectionDatum
}
export default function DirectionRadarSummary({
    datum
}: DirectionRadarSummaryProps) {

    const entries = useMemo(() => RADAR_DIRECTIONS.map((dir) => {
        const direction = dir
        const value = datum[dir]

        return {
            direction,
            value
        }
    }), [datum])

    return (
        <div className="grid grid-cols-2 content-between @sm:grid-cols-3 gap-5 w-full">
            {entries.map(({ direction, value }, idx) => (
                <VisualizationChiclet key={`direction-radar-summary-${idx}`} label={direction}>
                    <>
                        {value.toLocaleString()}
                    </>
                </VisualizationChiclet>
            ))}
        </div>
    )
}
