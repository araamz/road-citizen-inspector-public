import { twMerge } from "tailwind-merge";
import type { PieDatum } from "./PieChartVisualization"

export type PieChartLegendProps = {
    datums: Array<PieDatum>
    labelClassname?: string
    glyphSizePx?: number;
}
export default function PieChartLegend({
    datums,
    labelClassname,
    glyphSizePx = 10
}: PieChartLegendProps) {

    return (
        <div className="flex flex-wrap gap-x-5 gap-2.5 justify-center w-full">
            {datums.map((d, idx) =>
                <div key={`pie-chart-legend-${idx}`} className="flex items-center gap-1">
                    <svg width={glyphSizePx} height={glyphSizePx}>
                        <rect
                            fill={d.color}
                            cx={glyphSizePx / 2}
                            cy={glyphSizePx / 2}
                            width={glyphSizePx}
                            height={glyphSizePx}
                            rx={glyphSizePx / 5}
                            ry={glyphSizePx / 5}
                        />
                    </svg>
                    <p className={twMerge(labelClassname, 'font-medium text-xs')}>
                        {d.label}
                    </p>
                </div>
            )}
        </div>
    )
}