import { FaRegHardDrive } from "react-icons/fa6";
import DeviceVital from "./DeviceVital";
import StatusVitalInformation from "./StatusVitalInformation";

export type StorageVitalProps = {
    freePercent: number;
    lastUpdated: Date
    status: {
        shortSummary: string;
        message: string;
        error: boolean;
    }
}
export default function StorageVital({
    freePercent,
    status,
    lastUpdated
}: StorageVitalProps) {

    return (
        <DeviceVital
            icon={FaRegHardDrive}
            label={`${freePercent}% Free`}
        >
            <StatusVitalInformation
                metric={{
                    value: `${freePercent}%`,
                    text: status.shortSummary,
                    type: status.error ? 'error' : 'normal'
                }}
                description={status.message}
                lastUpdated={lastUpdated}
            />
        </DeviceVital>
    )
}