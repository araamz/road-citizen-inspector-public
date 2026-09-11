import { FaCar, FaMotorcycle, FaTruck } from "react-icons/fa";
import { HiMiniQuestionMarkCircle } from "react-icons/hi2";
import type { VehicleKey } from "@/constants";

export default function renderVehicleTypeIcon(vehicleType: VehicleKey) {

    if (vehicleType === 'car') return FaCar
    if (vehicleType === 'motorcycle') return FaMotorcycle
    if (vehicleType === 'truck') return FaTruck
    else return HiMiniQuestionMarkCircle


}