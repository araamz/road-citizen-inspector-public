import type { DirectionKey } from "@/constants"

export default function directionAbbreviation(direction: DirectionKey) {
    if (direction === 'north') return "N"
    else if (direction === 'northeast') return "NE"
    else if(direction === 'east') return "E"
    else if (direction === 'southeast') return "SE"
    else if (direction === 'south') return "S"
    else if (direction === 'southwest') return "SW"
    else if (direction === 'west') return "W"
    return "NW"
}