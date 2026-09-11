import { MdOutlineBattery0Bar, MdOutlineBattery2Bar, MdOutlineBattery4Bar, MdOutlineBattery5Bar, MdOutlineBatteryFull } from "react-icons/md"

export default function renderBatteryIcon(batteryLevelPercentage: number) {
    if (batteryLevelPercentage <= 0) return MdOutlineBattery0Bar
    else if (batteryLevelPercentage <= 25) return MdOutlineBattery2Bar
    else if (batteryLevelPercentage <= 50) return MdOutlineBattery4Bar
    else if (batteryLevelPercentage <= 75) return MdOutlineBattery5Bar
    else return MdOutlineBatteryFull
}