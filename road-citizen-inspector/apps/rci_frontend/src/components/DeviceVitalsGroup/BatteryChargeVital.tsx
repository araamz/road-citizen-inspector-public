import { MdOutlineBattery0Bar, MdOutlineBattery2Bar, MdOutlineBattery4Bar, MdOutlineBattery5Bar, MdOutlineBatteryFull } from "react-icons/md";
import DeviceVital from "./DeviceVital";
import StatusVitalInformation from "./StatusVitalInformation";
import type { IconType } from "react-icons";

export type BatteryChargeVitalProps = {
    chargePercent: number
    lastUpdated: Date;
    status: {
        shortSummary: string;
        message: string;
        error: boolean;
    }
}
export default function BatteryChargeVital({
    chargePercent,
    status,
    lastUpdated,
}: BatteryChargeVitalProps) {

    const batteryPreview = (): IconType => {
        if (chargePercent <= 0) return MdOutlineBattery0Bar
        else if (chargePercent <= 25) return MdOutlineBattery2Bar
        else if (chargePercent <= 50) return MdOutlineBattery4Bar
        else if (chargePercent <= 75) return MdOutlineBattery5Bar
        else return MdOutlineBatteryFull
    }

    return (
        <DeviceVital
            label={`${chargePercent}% Charge`}
            icon={batteryPreview()}
        >
            <StatusVitalInformation
                metric={{
                    value: `${chargePercent}%`,
                    text: status.shortSummary,
                    type: status.error ? 'error' : 'normal'
                }}
                description={status.message}
                lastUpdated={lastUpdated}
            />
        </DeviceVital>
    )
}