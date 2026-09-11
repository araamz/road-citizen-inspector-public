import { HiCheckCircle, HiExclamationTriangle } from "react-icons/hi2";
import type { StatusValueKey } from "@/constants"


export default function renderDeviceState(state: StatusValueKey) {
    if (state === 'ok') {
        return {
            label: 'Operational',
            icon: HiCheckCircle
        }
    } else {
        return {
            label: "System Error",
            icon: HiExclamationTriangle
        }
    }
}