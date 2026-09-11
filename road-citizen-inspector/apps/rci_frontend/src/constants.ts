export const VEHILCE_KEY_COLORS: Array<string> = ["#f39c12", "#27ae60", "#c0392b", "#2c3e50"] as const
export const VEHICLE_TYPES = ["car", "motorcycle", "truck", "unknown"] as const
export type VehicleKey = typeof VEHICLE_TYPES[number]

export const DIRECTIONS = [
    "north",
    "northeast",
    "east",
    "southeast",
    "south",
    "southwest",
    "west",
    "northwest"
] as const
export type DirectionKey = typeof DIRECTIONS[number]

export const LANES_STR = ["1", "2", "3", "4"] as const
export type LaneStrKey = typeof LANES_STR[number]

export const STATUS_VALUES = ["ok", "error"] as const
export type StatusValueKey = typeof STATUS_VALUES[number]

export const ROAD_TYPES = ["sddl", "sdsl", "dddl", "ddsl"] as const
export type RoadTypeKey = typeof ROAD_TYPES[number]