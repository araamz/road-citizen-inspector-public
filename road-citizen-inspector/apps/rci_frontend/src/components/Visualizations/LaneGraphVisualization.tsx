import { useMemo } from "react"
import HorizontalBarStackVisualization from "./HorizontalBarStackVisualization"
import type {HorizontalBarStackDatum, HorizontalBarStackVisualizationProps} from "./HorizontalBarStackVisualization";
import type {LaneStrKey, VehicleKey} from "@/constants";
import type { ReadingBreakdown } from "@road-citizen-inspector/visualization";
import { LANES_STR,  VEHICLE_TYPES, VEHILCE_KEY_COLORS  } from "@/constants"

export type LaneGroup = Partial<Record<LaneStrKey, ReadingBreakdown>>;

export type LaneGraphVisualizationProps = {
  laneCounts: LaneGroup
  binVehicleCount?: number
  bandAxis?: HorizontalBarStackVisualizationProps<any, any>['bandAxis'] 
  countsAxis?: HorizontalBarStackVisualizationProps<any, any>['countsAxis'] 
  margins?: HorizontalBarStackVisualizationProps<any, any>['margins'] 
} 

export default function LaneGraphVisualization({
  laneCounts,
  binVehicleCount,
  bandAxis,
  countsAxis,
  margins
}: LaneGraphVisualizationProps) {
  const datums = useMemo(
    () =>
      Object.entries(laneCounts)
        .map(([lane, br]): HorizontalBarStackDatum<LaneStrKey, VehicleKey> => {
          const laneKey = LANES_STR.find((laneStr) => laneStr === lane)

          if (!laneKey) {
            throw new Error("Failed to index Lane Key for Lane Graph Visualization.")
          }

          return {
            datumKey: laneKey,
            car: br.car,
            truck: br.truck,
            motorcycle: br.motorcycle,
            unknown: br.unknown
          }
        }),
    [laneCounts]
  )

  const valueKeys = VEHICLE_TYPES.map((t, idx) => ({
    key: t,
    color: VEHILCE_KEY_COLORS[idx]
  }))

  const totalVehicleCount = useMemo(() => {
    if (binVehicleCount !== undefined) return binVehicleCount

    const counts = Object.values(laneCounts)
      .map((breakdown) =>
        Object.values(breakdown).reduce((acc, count) => acc + count, 0)
      )

    if (counts.length === 0) return 0

    return Math.max(...counts)
  }, [binVehicleCount, laneCounts])

  return (
    <HorizontalBarStackVisualization
      title="lane-graph-visualization"
      datums={datums}
      valueKeys={valueKeys}
      totalCount={totalVehicleCount}
      countsAxis={{
        height: 50,
        labelOffset: 25,
        label: "Vehicle Count",
        showGrid: true,
        tickOffset: 5,
        ...countsAxis
      }}
      bandAxis={{
        width: 50,
        formatter: (lane) => `Lane ${lane}`,
        ...bandAxis
      }}
      margins={{
        left: 0,
        right: 30,
        top: 0,
        bottom: 0,
        ...margins
      }}
    />
  )
}