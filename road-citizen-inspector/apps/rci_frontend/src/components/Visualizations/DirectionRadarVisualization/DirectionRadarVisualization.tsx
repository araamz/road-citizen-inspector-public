import { scaleLinear } from "@visx/scale"
import { useParentSize } from "@visx/responsive"
import { useMemo } from "react"
import { Group } from "@visx/group"
import { Line, LineRadial } from "@visx/shape"
import { Text  } from "@visx/text"
import type {TextProps} from "@visx/text";

const POLYGON_DEGREES = 360

export const RADAR_DIRECTIONS = [
    "north",
    "northeast",
    "east",
    "southeast",
    "south",
    "southwest",
    "west",
    "northwest"
] as const
export type DirectionKey = typeof RADAR_DIRECTIONS[number]
export type DirectionDatum = Record<DirectionKey, number>
export type DirectionRadarVisualizationProps = {
    datum: DirectionDatum,
    levels?: number,
    margins?: {
        left: number;
        right: number;
        top: number;
        bottom: number
    },
    cardinalAxis?: {
        visible?: boolean
        styling?: TextProps['style']
    },
    levelAxis?: {
        visible?: boolean;
        styling?: TextProps['style']
    }
}

// Available Helpers
export const directionAbbreviation = (direction: DirectionKey) => {
    if (direction === 'north') return "N"
    else if (direction === 'northeast') return "NE"
    else if(direction === 'east') return "E"
    else if (direction === 'southeast') return "SE"
    else if (direction === 'south') return "S"
    else if (direction === 'southwest') return "SW"
    else if (direction === 'west') return "W"
    return "NW"
}

export default function DirectionRadarVisualization({
    datum,
    levels = 3,
    margins = {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
    },
    cardinalAxis = {
        visible: true
    },
    levelAxis = {
        visible: true
    }
}: DirectionRadarVisualizationProps) {

    const { parentRef, width, height } = useParentSize()

    // Structural Visualization Artifacts
    const innerWidth = useMemo(() => width - margins.left - margins.right, [width, margins.left, margins.right])
    const innerHeight = useMemo(() => height - margins.top - margins.bottom, [height, margins.bottom, margins.top])

    const radius = useMemo(() => Math.max(innerWidth, innerHeight) / 2, [innerWidth, innerHeight])

    const maxDirectionCount = useMemo(() => Object.entries(datum).reduce(
        (acc, [, count]) => Math.max(acc, count)
        , 0)
        , [datum])

    // Scales
    const countsScale = useMemo(() =>
        scaleLinear({
            domain: [0, maxDirectionCount],
            range: [0, radius]
        })
        , [maxDirectionCount, radius])

    const directionScale = useMemo(() =>
        scaleLinear({
            domain: [POLYGON_DEGREES, 0],
            range: [0, 2 * -Math.PI]
        })
        , [POLYGON_DEGREES])

    // Rendering Functions
    const cardinalDegrees = Object.fromEntries(RADAR_DIRECTIONS.map((dir, idx) => {
        const stepAngle = (POLYGON_DEGREES) / (RADAR_DIRECTIONS.length)

        const majorAngle = idx * stepAngle;
        const minorAngle = RADAR_DIRECTIONS.length % 2 === 0 ? 0 : POLYGON_DEGREES / RADAR_DIRECTIONS.length / 2;

        return [dir, (majorAngle + minorAngle)]
    })) as Record<DirectionKey, number>

    const activityRendering = useMemo(() => {

        const points = RADAR_DIRECTIONS.reduce<Array<{ x: number, y: number }>>((acc, direction) => {

            const angle = cardinalDegrees[direction]

            if (datum[direction] === 0) return acc;

            const x = countsScale(datum[direction]) * Math.sin(directionScale(angle))
            const y = -countsScale(datum[direction]) * Math.cos(directionScale(angle))

            return [...acc, {
                x, y
            }]
        }, [])


        // Account for edge case: there is only one point, thus making a segment.
        if (points.length === 1) points.push({
            x: 0,
            y: 0
        })

        const path = points.map(({ x, y }) => `${x},${y}`).join(' ')

        return {
            points,
            path
        }

    }, [datum, countsScale, directionScale])

    const cardinalAngles = Array(RADAR_DIRECTIONS.length + 1).fill(0).map((_, idx) => {

        const angleCount = RADAR_DIRECTIONS.length;

        const angleStep = POLYGON_DEGREES / angleCount

        const majorAngle = idx * angleStep;
        const minorAngle = angleCount % 2 === 0 ? 0 : angleStep / 2;

        return (majorAngle + minorAngle)
    })

    const cardinalLines = useMemo(() =>
        RADAR_DIRECTIONS.map((direction, idx) => {

            const offset = 10;
            const directionAngle = cardinalDegrees[direction]

            const x = radius * Math.sin(directionScale(directionAngle))
            const y = radius * -Math.cos(directionScale(directionAngle))


            const labelMetadata = (): {
                label: string,
                xOffset: number;
                yOffset: number;
                primary?: boolean;
            } => {

                const xOffset = offset * Math.round(Math.sin(directionScale(directionAngle)))
                const yOffset = offset * -Math.round(Math.cos(directionScale(directionAngle)))

                return {
                    label: directionAbbreviation(direction),
                    yOffset,
                    xOffset,
                    primary: idx % 2 === 0 ? true : false
                }

            }

            return {
                descriptor: labelMetadata(),
                x,
                y
            }
        })
        , [datum, directionScale, countsScale, maxDirectionCount])

    const levelLabels = useMemo(() => {

        const levelStep = Math.floor(maxDirectionCount / levels);

        return Array(levels).fill({
            x: 0,
            y: 0,
            value: 0
        }).map((_, idx) => {
            const value = idx * levelStep
            const x = 0;
            const y = -countsScale(idx * levelStep)

            return {
                x,
                y,
                value
            }
        })


    }, [radius, maxDirectionCount, levels])

    return (
        <div ref={parentRef} className="relative w-full h-full size-full">
            <svg width={width} height={height}>
                <Group top={innerHeight / 2 + margins.top} left={innerWidth / 2 + margins.left}>
                    {
                        cardinalAxis.visible && cardinalLines.map((point, idx) =>
                            <Text x={point.x} y={point.y}
                                key={`cardinal-label-${idx}`}
                                textAnchor="middle"
                                verticalAnchor="middle"
                                dx={point.descriptor.xOffset}
                                dy={point.descriptor.yOffset}
                                style={{
                                    fontSize: "0.8rem",
                                    fontWeight: point.descriptor.primary ? 500 : 300,
                                    fill: point.descriptor.primary ? "#000000" : "oklch(63.2% 0 0)",
                                    ...cardinalAxis.styling
                                }}>
                                {point.descriptor.label}
                            </Text>
                        )
                    }
                    {
                        cardinalLines.map((point, idx) =>
                            <Line
                                key={`cardinal-line-${idx}`}
                                from={{ x: 0, y: 0 }}
                                to={point}
                                stroke="oklch(92.2% 0 0)"
                                strokeDasharray={4}
                                strokeWidth={1}
                            />
                        )
                    }
                    {
                        [...new Array(levels - 1)].map((_, i) => (
                            <LineRadial
                                key={`direction-radial-${i}`}
                                data={cardinalAngles}
                                angle={(d) => directionScale(d)}
                                radius={((i + 1) * radius) / levels}
                                stroke="oklch(92.2% 0 0)"
                                strokeWidth={0.5}
                                strokeLinecap="round"
                            />
                        ))
                    }
                    <LineRadial
                        key={`direction-radial-border`}
                        data={cardinalAngles}
                        angle={(d) => directionScale(d)}
                        radius={radius}
                        stroke="oklch(92.2% 0 0)"
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                    {maxDirectionCount > 0 && (
                        <>
                            <polygon
                                points={activityRendering.path}
                                fill="oklch(82.8% 0.189 84.429)"
                                fillOpacity={0.25}
                                stroke="oklch(82.8% 0.189 84.429)"
                                strokeWidth={1.5}
                            />
                            {
                                activityRendering.points.map((point, idx) => (
                                    <circle key={`direction-point-${idx}`} cx={point.x} cy={point.y} r={2} fill="#000000" />
                                ))
                            }
                            {
                                levelAxis.visible && levelLabels.map((label, idx) =>
                                    <Text x={label.x} y={label.y}
                                        key={`direction-level-${idx}`}
                                        verticalAnchor="end"
                                        textAnchor="end"
                                        dx={-2.5}
                                        dy={-2.5}
                                        style={{
                                            fontSize: '0.5rem',
                                            fontWeight: 500,
                                            ...levelAxis.styling
                                        }}
                                    >
                                        {label.value}
                                    </Text>
                                )
                            }
                        </>
                    )}
                </Group>
            </svg>
        </div>
    )

}

// TODO: Add Value Per Ring such that maxDirectionCount / levelCount
// TODO: Make Reusable - DirectionDatumFormat