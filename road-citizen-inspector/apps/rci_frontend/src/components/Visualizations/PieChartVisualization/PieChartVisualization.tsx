import { useParentSize } from "@visx/responsive";
import { Pie } from "@visx/shape";
import { Text, type TextProps } from "@visx/text";
import { useMemo } from "react";

export type PieDatum<TLabelKey extends string = string> = {
    color: string;
    label: TLabelKey;
    value: number;
}
export type PieChartVisualizationProps<TLabelKey extends string> = {
    datums: Array<PieDatum<TLabelKey>>,
    padAngle?: number,
    radiusPercentage?: number;
    centerText?: string;
    centerTextStyling?: TextProps;
    showPlaceholder?: boolean;
    margins?: {
        left: number,
        right: number,
        bottom: number,
        top: number;
    }
}
export default function PieChartVisualization<TLabelKey extends string>({
    datums,
    padAngle = 0.05,
    radiusPercentage = .25,
    centerText,
    centerTextStyling,
    showPlaceholder,
    margins = {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0
    }
}: PieChartVisualizationProps<TLabelKey>) {

    const { width, height, parentRef } = useParentSize()

    // Structural Artifacts
    const innerWidth = useMemo(() => width - margins.left - margins.right, [width, margins.left, margins.right])
    const innerHeight = useMemo(() => height - margins.top - margins.bottom, [height, margins.top, margins.bottom])

    // useEffect(() => {
    //     console.log("(width, height)", innerWidth, innerHeight)
    // }, [innerWidth, innerHeight])

    const radius = useMemo(() => Math.max(innerHeight, innerWidth) / 2, [innerHeight, innerWidth])
    const center = useMemo(() => {
        const x = innerWidth / 2;
        const y = innerHeight / 2;

        return {
            x, y
        }
    }, [innerHeight, innerWidth])

    return (
        <div ref={parentRef} className="size-full">
            <svg width={innerWidth} height={innerHeight}>
                {
                    showPlaceholder ? (
                        <circle
                            cx={center.x + margins.left}
                            cy={center.y + margins.top}
                            r={radius > 0 ? radius - 4 : 0}
                            fill="none"
                            stroke="oklch(92.2% 0 0)"
                            strokeWidth={2}
                            strokeDasharray={10}
                        />
                    ) : (
                        <>
                            <Pie
                                top={center.y + margins.top}
                                left={center.x + margins.left}
                                radius={radius}
                                data={datums}
                                pieValue={(d) => d.value}
                                fill={(d) => d.data.color}
                                outerRadius={radius}
                                innerRadius={radius - (radius * radiusPercentage)}
                                padAngle={padAngle}
                            />
                            {
                                centerText && (
                                    <Text
                                        cx={center.x}
                                        cy={center.y}
                                        dy={center.y + margins.top}
                                        dx={center.x + margins.left}
                                        scaleToFit
                                        width={50}
                                        textAnchor="middle"
                                        verticalAnchor="middle"
                                        fill="black"
                                        fontWeight={500}
                                        {...centerTextStyling}
                                    >
                                        {centerText}
                                    </Text>
                                )
                            }
                        </>
                    )
                }
            </svg>
        </div>
    )
}