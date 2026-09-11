import { HiCheckCircle, HiExclamationTriangle } from "react-icons/hi2";
import DeviceVital from "./DeviceVital"
import StatusVitalInformation from "./StatusVitalInformation";
import type { StatusValueKey } from "@/constants"

export type SystemStateVitalProps = {
    state: StatusValueKey,
    status: {
        shortSummary: string;
        message: string;
        error: boolean;
    }
    lastUpdated: Date
}
export default function SystemStateVital({
    state,
    status,
    lastUpdated
}: SystemStateVitalProps) {

    const statusPreview = () => {

        if (state === 'ok') return {
            icon: HiCheckCircle,
            label: "Operational" 
        }
        else return {
            icon: HiExclamationTriangle,
            label: "System Error"
        }
    }

    const processedValue = state === 'ok' ? "Operational" : "System Error"

    return (
        <DeviceVital
            label={statusPreview().label}
            icon={statusPreview().icon}
        >
            <StatusVitalInformation
                metric={{
                    value: processedValue,
                    text: status.shortSummary,
                    type: status.error ? 'error' : 'normal'
                }}
                description={status.message}
                lastUpdated={lastUpdated}
            />
        </DeviceVital>
    )
}