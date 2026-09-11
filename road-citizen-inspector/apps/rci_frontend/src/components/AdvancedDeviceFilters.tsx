import { useMemo } from "react";
import { HiFunnel } from "react-icons/hi2";
import Drawer from "./Drawer/Drawer"
import AdvancedDeviceFilterForm from "./Forms/AdvancedDeviceFilterForm";
import Button from "./Button";
import type {DrawerRootProps} from "./Drawer/Drawer";
import type { DeviceConfigurationData } from "@road-citizen-inspector/contracts";
import type { AdvancedDeviceFilterFormProps } from "./Forms/AdvancedDeviceFilterForm";
import type { AdvancedDeviceFiltersFormSchema } from "@/schemas/AdvancedDeviceFiltersForm.schema";
import type { DirectionKey, LaneStrKey } from "@/constants";
import { DIRECTIONS, LANES_STR, ROAD_TYPES } from "@/constants"

export type AdvancedDeviceFiltersProps = {
    deviceConfiguration?: DeviceConfigurationData['configuration']
    queryCallback: AdvancedDeviceFilterFormProps['query']
    removeFiltersCallback: AdvancedDeviceFilterFormProps['removeFilters']
    disabled?: boolean
    initalValues?: AdvancedDeviceFiltersFormSchema
    drawerProps?: DrawerRootProps
}
export default function AdvancedDeviceFilters({
    deviceConfiguration,
    queryCallback,
    removeFiltersCallback,
    disabled,
    initalValues,
    drawerProps
}: AdvancedDeviceFiltersProps) {

    const vehicleSelections = useMemo(() => {

        const roadType = ROAD_TYPES.find((rt) => rt === deviceConfiguration?.road_type)
        const primaryDirection = DIRECTIONS.find((dir) => dir === deviceConfiguration?.road_primary_direction)
        const secondaryDirection = DIRECTIONS.find((dir) => dir === deviceConfiguration?.road_secondary_direction)

        if (!primaryDirection || !secondaryDirection || !roadType) return null;

        const vehicleDirections = (): Array<DirectionKey> => {

            if (roadType === 'sddl' || roadType === 'sdsl') return [primaryDirection]
            return [primaryDirection, secondaryDirection]
        }

        const vehicleLanes = (): Array<LaneStrKey> => {

            const laneOne = LANES_STR[0]
            const laneTwo = LANES_STR[1]

            if (roadType === 'sddl') return [laneOne, laneTwo]
            if (roadType === 'ddsl') return [laneOne, laneTwo]
            if (roadType === 'sdsl') return [laneOne]
            return [...LANES_STR]

        }

        return {
            lanes: vehicleLanes(),
            directions: vehicleDirections()
        }

    }, [deviceConfiguration])

    return (
        <Drawer
            title="Advanced Device Query"
            swipeDirection="right"
            description="Adjust these filters to explore specific traffic conditions such as setting speed ranges, picking directions, and choosing vehicle types. You can also filter by device health, including battery, storage, and status."
            triggerProps={{
                nativeButton: false,
                render: <div />
            }}
            maxWidthClassName="max-w-[700px]"
            content={
                <AdvancedDeviceFilterForm
                    disabled={disabled}
                    formName="advanced-device-filter-form"
                    selections={vehicleSelections ? {
                        vehicleDirectionSelections: vehicleSelections.directions,
                        vehicleLaneSelections: vehicleSelections.lanes
                    } : undefined}
                    initalValues={initalValues}
                    query={queryCallback}
                    removeFilters={removeFiltersCallback}
                />
            }
            {
                ...drawerProps
            }
        >
            <Button startIcon={HiFunnel} disabled={disabled}>
                Filter
            </Button>
        </Drawer>
    )

}