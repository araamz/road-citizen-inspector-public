import { useMemo } from "react"
import { scaleOrdinal } from "@visx/scale"
import { LegendItem, LegendLabel, LegendOrdinal } from "@visx/legend"
import ColorGlyph from "../ColorGlyph"
import { VEHICLE_KEYS, VEHICLE_KEY_COLORS } from "./CompositeHistogramVisualization"

export default function CompositeHistogramLegend() {

    const vehicleTypeColors = useMemo(() =>
        scaleOrdinal({
            domain: [...VEHICLE_KEYS],
            range: [...VEHICLE_KEY_COLORS]
        })
        , [])

    return (
        <LegendOrdinal direction="row" itemDirection="row" scale={vehicleTypeColors}>
            {(labels) =>
                <div className="flex flex-wrap gap-x-4 justify-center w-full">
                    {
                        labels.map((l, idx) =>
                            <LegendItem key={`composite-histogram-legend-${idx}`} className="flex items-center gap-1.5">
                                <ColorGlyph color={vehicleTypeColors(l.datum)} size={10} radius={2} />
                                <LegendLabel className="text-xs font-medium uppercase">
                                    {l.text}
                                </LegendLabel>
                            </LegendItem>)
                    }
                </div>
            }
        </LegendOrdinal>
    )
}