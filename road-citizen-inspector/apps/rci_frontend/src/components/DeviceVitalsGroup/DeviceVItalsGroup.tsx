import { useQuery } from "@tanstack/react-query";
import { IoRefresh } from "react-icons/io5";
import LoadingSpinner from "../LoadingSpinner";
import IconPlaceholder from "../IconPlaceholder";
import BatteryChargeVital from "./BatteryChargeVital";
import StorageVital from "./StorageVital";
import SystemStateVital from "./SystemStateVital";
import type {BatteryChargeVitalProps} from "./BatteryChargeVital";
import type {StorageVitalProps} from "./StorageVital";
import type {SystemStateVitalProps} from "./SystemStateVital";
import useLatestDeviceStatusOptions from "@/hooks/queries/status/UseLatestDeviceStatusOptions";


export type DeviceVitalsGroupProps = {
    deviceId: number;
}
export default function DeviceVitalsGroup({
    deviceId
}: DeviceVitalsGroupProps) {

    const {
        data: latestDeviceStatus,
        isPending: latestDeviceStatusPending,
        error: latestDeviceStatusError,
        refetch
    } = useQuery(useLatestDeviceStatusOptions(deviceId))

    if (latestDeviceStatusPending) return (
        <div className="
        
            flex flex-row gap-2.5 items-center
            bg-white h-10 px-3.5
            border border-neutral-300 rounded-md
            
        ">
            <span>
                <LoadingSpinner size="xs" />
            </span>
            <p className="text-xs font-medium">
                Loading
            </p>
        </div>
    )
    if (latestDeviceStatusError) return (
        <div className="
            flex flex-row gap-2.5 items-center
            bg-white h-10 px-3.5
            border border-neutral-300 rounded-md
        ">
            <div>
                <p className="text-xs font-medium">
                    Status Unavailable
                </p>
            </div>
            <button onClick={() => refetch()}>
                <IconPlaceholder
                    size="xs"
                    icon={IoRefresh}
                    tooltipOptions={{
                        label: "Refresh Status",
                        contentOptions: {
                            side: "bottom",
                            collisionPadding: 10
                        }
                    }}
                />
            </button>
        </div>
    )

    const summaries = (): {
        battery: BatteryChargeVitalProps['status'],
        storage: StorageVitalProps['status'],
        systemState: SystemStateVitalProps['status']
    } => {

        const normalBatteryConditions: BatteryChargeVitalProps['status'] = {
            message: "Battery is charged and operating normally.",
            shortSummary: "Operating Normally",
            error: false
        }

        const normalStorageConditions: StorageVitalProps['status'] = {
            message: "Storage usage is minimal.",
            shortSummary: "Storage Available",
            error: false
        }

        const normalSystemState: SystemStateVitalProps['status'] = {
            message: "Traffic Counting Device is operating normally and collecting vehicle counts.",
            shortSummary: "Monitoring Active",
            error: false
        }


        if (latestDeviceStatus.errorSummary) {

            const processedBattery = (): BatteryChargeVitalProps['status'] => {
                if (latestDeviceStatus.errorSummary && latestDeviceStatus.errorSummary.battery.present) {
                    return {
                        message: "Battery is below operating conditions for monitoring. Recharge the Traffic Counting Device battery.",
                        shortSummary: "Low Battery",
                        error: true
                    }
                } else {
                    return normalBatteryConditions
                }
            }

            const processedStorage = (): StorageVitalProps['status'] => {
                if (latestDeviceStatus.errorSummary && latestDeviceStatus.errorSummary.storage.present) {
                    return {
                        message: "Storage is below operating conditions for monitoring. Monitoring is suspended untill uplinks are transferred or cleared.",
                        shortSummary: "Low Storage",
                        error: true
                    }
                } else {
                    return normalStorageConditions
                }
            }

            return {
                battery: processedBattery(),
                storage: processedStorage(),
                systemState: {
                    message: "System is not in optimal conditions for monitoring. Please consider restarting or recharging the traffic counting device.",
                    shortSummary: "Monitoring Suspended",
                    error: true
                }
            }

        }

        return {
            battery: normalBatteryConditions,
            storage: normalStorageConditions,
            systemState: normalSystemState
        }

    }

    return (
        <>
            <BatteryChargeVital
                chargePercent={latestDeviceStatus.status.device_battery_level}
                status={summaries().battery}
                lastUpdated={new Date(latestDeviceStatus.status.status_capture_time)}
            />
            <StorageVital
                freePercent={latestDeviceStatus.status.device_storage_level}
                status={summaries().storage}
                lastUpdated={new Date(latestDeviceStatus.status.status_capture_time)}
            />
            <SystemStateVital
                state={latestDeviceStatus.errorSummary ? 'error' : 'ok'}
                status={summaries().systemState}
                lastUpdated={new Date(latestDeviceStatus.status.status_capture_time)}
            />
        </>
    )
}