import { LuGauge } from 'react-icons/lu'
import { FaCompass, FaRegHardDrive } from "react-icons/fa6";
import DataPointCharm from "./DataPointCharm"
import type { DeviceDataSource } from "@road-citizen-inspector/visualization"
import type { DataPointCharmProps } from "./DataPointCharm"
import { DIRECTIONS, STATUS_VALUES, VEHICLE_TYPES } from "@/constants"
import renderVehicleTypeIcon from "@/utils/renderVehicleTypeIcon"
import renderBatteryIcon from '@/utils/renderBatteryIcon';
import renderDeviceState from '@/utils/renderDeviceState';

export type DeviceDataPointItemProps = {
    dataSource: DeviceDataSource
    index?: number
}
export default function DeviceDataPointItem({
    dataSource,
    index
}: DeviceDataPointItemProps) {

    const timestamp = () => {
        if (dataSource.type === 'reading') return new Date(dataSource.reading.vehicle_detection_time).toLocaleTimeString()
        else return new Date(dataSource.status.status_capture_time).toLocaleTimeString()
    }

    const charmItems = (): Array<DataPointCharmProps> => {
        if (dataSource.type === 'reading') {

            const vehicleTypeCharm = (): DataPointCharmProps => {
                const vehicleType = VEHICLE_TYPES.find((vt) => vt === dataSource.reading.vehicle_type)
                if (!vehicleType) throw new Error("Failed to index Vehicle Type for Device Data Point Item Charm.")

                return {
                    label: "Vehicle Type",
                    icon: renderVehicleTypeIcon(vehicleType),
                    value: vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)
                }
            }

            const vehicleSpeedCharm = (): DataPointCharmProps => {
                return {
                    icon: LuGauge,
                    label: "Vehicle Speed",
                    value: `${dataSource.reading.vehicle_speed.toLocaleString()} MPH`
                }
            }
            const vehicleDirectionCharm = (): DataPointCharmProps => {

                const vehicleDirection = DIRECTIONS.find((dir) => dir === dataSource.reading.vehicle_direction)

                if (!vehicleDirection) throw new Error("Failed to index Vehicle Direction for Device Data Point Item Charm.")

                return {
                    icon: FaCompass,
                    label: "Vehicle Direction",
                    value: vehicleDirection.charAt(0).toUpperCase() + vehicleDirection.slice(1)
                }
            }

            return [
                vehicleTypeCharm(),
                vehicleSpeedCharm(),
                vehicleDirectionCharm()
            ]


        } else {


            const batteryLevelCharm = (): DataPointCharmProps => {
                const batteryLevel = Number(dataSource.status.device_battery_level)
                return {
                    label: "Battery Level",
                    value: `${batteryLevel}%`,
                    icon: renderBatteryIcon(batteryLevel),
                }
            }

            const storageLevelCharm = (): DataPointCharmProps => {
                const storageLevel = Number(dataSource.status.device_storage_level)
                return {
                    label: "Storage Level",
                    value: `${storageLevel}%`,
                    icon: FaRegHardDrive
                }
            }

            const statusCharm = (): DataPointCharmProps => {
                const deviceStatus = STATUS_VALUES.find((val) => val === dataSource.status.device_sensor_status)

                if (!deviceStatus) throw new Error("Failed to index Device Status for Device Data Point Item Charm.")

                const statusValue = renderDeviceState(deviceStatus)

                return {
                    label: "Device State",
                    value: statusValue.label,
                    icon: statusValue.icon
                }

            }

            return [
                batteryLevelCharm(),
                storageLevelCharm(),
                statusCharm()
            ]
        }
    }


    return (
        <div className="
            flex
            border-b border-b-neutral-300 last:border-b-0
            px-1 py-2.5 gap-2.5
        ">
            {
                index !== undefined ? (
                    <p className='

                        bg-black px-2 rounded-md
                        text-white font-medium
                        flex items-center justify-center
                    '>
                        {index + 1}
                    </p>
                ) : undefined
            }
            <div className='grow flex justify-between items-center gap-2.5'>
                <div>
                    <p className='font-medium text-nowrap'>
                        {timestamp()}
                    </p>
                    <p className='tracking-wider text-sm text-neutral-400'>
                        {dataSource.type === "reading" ? "Reading" : "Status"}
                    </p>
                </div>
                <div className='flex flex-row gap-2.5 justify-end flex-wrap'>
                    {charmItems().map((charmItem, idx) =>
                        <DataPointCharm 
                            key={`device-data-point-charm-${idx}`}
                            {...charmItem} 
                        />
                    )}
                </div>
            </div>
        </div>
    )
}