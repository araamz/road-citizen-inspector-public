import { FaRegHardDrive } from "react-icons/fa6";
import { MdOutlineBattery0Bar, MdOutlineBattery2Bar, MdOutlineBattery4Bar, MdOutlineBattery5Bar, MdOutlineBatteryFull } from "react-icons/md";
import { HiCheckCircle, HiExclamationTriangle, HiQuestionMarkCircle } from "react-icons/hi2";
import { useMemo } from "react";
import type { StatusData } from "@road-citizen-inspector/contracts"
import { STATUS_VALUES } from "@/constants";


export type DeviceStatusMetricProps = {
    type: 'battery' | 'storage' | 'state'
    status: StatusData;
}
export default function DeviceStatusMetric({
    type,
    status
}: DeviceStatusMetricProps) {

    const StatusIcon = useMemo(() => {

        if (type === 'battery') {
            if (status.device_battery_level <= 0) return MdOutlineBattery0Bar
            else if (status.device_battery_level <= 25) return MdOutlineBattery2Bar
            else if (status.device_battery_level <= 50) return MdOutlineBattery4Bar
            else if (status.device_battery_level <= 75) return MdOutlineBattery5Bar
            else return MdOutlineBatteryFull
        } else if (type === 'storage') return FaRegHardDrive
        else {

            const deviceState = STATUS_VALUES.find((s) => s === status.device_sensor_status)

            if (deviceState === 'ok') return HiCheckCircle
            if (deviceState === 'error') return HiExclamationTriangle
        }

        return HiQuestionMarkCircle
    }, [status])

    const label = () => {
        if (type === 'battery') return `${status.device_battery_level}%`
        if (type === 'storage') return `${status.device_storage_level}%`
        else {
            
            const deviceState = STATUS_VALUES.find((s) => s === status.device_sensor_status)
            
            if (deviceState === 'ok') return 'Operational'
            if (deviceState === 'error') return "System Error"


        }
        return "--"
    }

    return (
        <div className="bg-neutral-100 text-neutral-500 flex items-center gap-1.5 px-1.5 py-1 rounded-md">
            <span>
                <StatusIcon size={16} />
            </span>
            <p className="font-medium text-sm text-nowrap">
                {label()}
            </p>
        </div>
    )
}