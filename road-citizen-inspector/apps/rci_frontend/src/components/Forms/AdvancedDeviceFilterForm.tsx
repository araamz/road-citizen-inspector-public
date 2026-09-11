import { DIRECTIONS, LANES_STR, STATUS_VALUES, VEHICLE_TYPES, type DirectionKey, type LaneStrKey } from "@/constants"
import { ADVANCED_DEVICE_FILTERS_FORM_SCHEMA, type AdvancedDeviceFiltersFormSchema } from "@/schemas/AdvancedDeviceFiltersForm.schema"
import { useEffect, useMemo, type MouseEvent } from "react"
import type { RadioItemProps } from "../Inputs/RadioInput/RadioItem"
import { useForm } from "react-hook-form"
import TextInput from "../Inputs/TextInput"
import Button from "../Button"
import CheckboxGroupInput from "../Inputs/CheckboxGroupInput/CheckboxGroupInput"
import CheckboxGroupItem from "../Inputs/CheckboxGroupInput/CheckboxGroupItem"
import SectionLabel from "../SectionLabel"
import { zodResolver } from "@hookform/resolvers/zod"
import _ from "lodash"

export type AdvancedDeviceFilterFormProps = {
    initalValues?: AdvancedDeviceFiltersFormSchema
    formName: string
    removeFilters?: {
        handler: (event: MouseEvent<HTMLButtonElement>) => void
        disabled?: boolean
    },
    query: {
        handler: (data: AdvancedDeviceFiltersFormSchema) => void
        disabled?: boolean
    }
    disabled?: boolean;
    selections?: {
        vehicleDirectionSelections: Array<DirectionKey>
        vehicleLaneSelections: Array<LaneStrKey>
    }
}

const CLEARED_STATE: AdvancedDeviceFiltersFormSchema = {
    vehicle_direction: [],
    vehicle_lane: [],
    vehicle_type: [],
    vehicle_speed_mininum: undefined,
    vehicle_speed_maximum: undefined,
    device_battery_mininum: undefined,
    device_battery_maximum: undefined,
    device_storage_mininum: undefined,
    device_storage_maximum: undefined,
    device_status: []
}

export default function AdvancedDeviceFilterForm({
    initalValues,
    selections,
    formName,
    query,
    removeFilters,
    disabled
}: AdvancedDeviceFilterFormProps) {

    const { register, formState, handleSubmit } = useForm<AdvancedDeviceFiltersFormSchema>({
        defaultValues: {
            ...initalValues,
            vehicle_type: initalValues?.vehicle_type ? initalValues.vehicle_type : [],
            vehicle_direction: initalValues?.vehicle_direction ? initalValues.vehicle_direction : [],
            vehicle_lane: initalValues?.vehicle_lane ? initalValues.vehicle_lane : [],
            device_status: initalValues?.device_status ? initalValues.device_status : [],
        },
        resolver: zodResolver(ADVANCED_DEVICE_FILTERS_FORM_SCHEMA)
    })

    const filterSelections = useMemo(() => {

        const vTypes = VEHICLE_TYPES.map((t): RadioItemProps => ({
            label: t,
            value: t
        }))

        const vDirections = selections?.vehicleDirectionSelections.length ? (
            selections.vehicleDirectionSelections.map((dir): RadioItemProps => ({
                label: dir,
                value: dir
            }))
        ) : (
            DIRECTIONS.map((dir): RadioItemProps => ({
                label: dir,
                value: dir
            }))
        )

        const vLanes = selections?.vehicleLaneSelections.length ? (
            selections.vehicleLaneSelections.map((l): RadioItemProps => ({
                label: `Lane ${l}`,
                value: l
            }))
        ) : (
            LANES_STR.map((l): RadioItemProps => ({
                label: `Lane ${l}`,
                value: l
            }))
        )

        const dStatus = STATUS_VALUES.map((s): RadioItemProps => {
            if (s === 'ok') return {
                label: "Operational",
                value: s
            }
            else {
                return {
                    label: "Error",
                    value: s
                }
            }
        })

        return {
            vTypes,
            vDirections,
            vLanes,
            dStatus
        }

    }, [selections?.vehicleDirectionSelections, selections?.vehicleLaneSelections])
    
    useEffect(() => console.log("fs", formState.defaultValues, CLEARED_STATE))

    return (
        <form
            name={formName}
            onSubmit={handleSubmit(query.handler)}
            className="@container w-full flex flex-col gap-5"
        >
            <div className="flex flex-col gap-10">
                <div>
                    <SectionLabel size="md" textColor="black">
                        Reading Filtering
                    </SectionLabel>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-5 @md:grid @md:grid-cols-2 @md:items-end">
                            <TextInput
                                {...register('vehicle_speed_mininum', {
                                    setValueAs: (v) => v === "" || isNaN(v) ? undefined : Number(v)
                                })}
                                label="Vehicle Speed Mininum"
                                type="number"
                                description="Only include vehicles traveling at or above this speed."
                                error={formState.errors.vehicle_speed_mininum?.message}
                                disabled={disabled}
                            />
                            <TextInput
                                {...register('vehicle_speed_maximum', {
                                    setValueAs: (v) => v === "" || isNaN(v) ? undefined : Number(v)
                                })}
                                label="Vehicle Speed Maximum"
                                type="number"
                                description="Only include vehicles traveling at or below this speed."
                                error={formState.errors.vehicle_speed_maximum?.message}
                                disabled={disabled}
                            />
                        </div>
                        {filterSelections.vDirections.length > 1 ? (
                            <CheckboxGroupInput
                                label="Vehicle Direction"
                                description="Select one or more directions to view traffic coming from those paths."
                                error={formState.errors.vehicle_direction?.message}
                            >
                                {
                                    filterSelections.vDirections.map((selection, idx) =>
                                        <CheckboxGroupItem
                                            {...register('vehicle_direction')}
                                            key={`${formName}-vDirections-${selection.value}-${idx}`}
                                            value={selection.value}
                                            disabled={disabled}
                                        >
                                            {selection.label}
                                        </CheckboxGroupItem>
                                    )
                                }
                            </CheckboxGroupInput>
                        ) : undefined}

                        <CheckboxGroupInput
                            label="Vehicle Type"
                            description="Filter results by specific vehicle types, such as cars, trucks, or motorcycles."
                            error={formState.errors.vehicle_type?.message}
                        >
                            {
                                filterSelections.vTypes.map((selection, idx) =>
                                    <CheckboxGroupItem
                                        {...register('vehicle_type')}
                                        key={`${formName}-vTypes-${selection.value}-${idx}`}
                                        value={selection.value}
                                        disabled={disabled}
                                    >
                                        {selection.label}
                                    </CheckboxGroupItem>
                                )
                            }
                        </CheckboxGroupInput>
                        {filterSelections.vDirections.length > 1 ? (
                            <CheckboxGroupInput
                                label="Vehicle Lane"
                                description="Focus on vehicles detected in specific lanes."
                                error={formState.errors.vehicle_lane?.message}
                            >
                                {
                                    filterSelections.vLanes.map((selection, idx) =>
                                        <CheckboxGroupItem
                                            {...register('vehicle_lane')}
                                            key={`${formName}-vLanes-${selection.value}-${idx}`}
                                            value={selection.value}
                                            disabled={disabled}
                                        >
                                            {selection.label}
                                        </CheckboxGroupItem>
                                    )
                                }
                            </CheckboxGroupInput>
                        ) : undefined}
                    </div>
                </div>
                <div>
                    <SectionLabel size="md" textColor="black">
                        Status Filtering
                    </SectionLabel>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-5 @md:grid @md:grid-cols-2 @md:items-end">
                            <TextInput
                                {...register('device_battery_mininum', {
                                    setValueAs: (v) => v === "" || isNaN(v) ? undefined : Number(v)
                                })}
                                label="Device Battery Mininum"
                                description="Only include data from devices with at least this battery level."
                                type="number"
                                error={formState.errors.device_battery_mininum?.message}
                                disabled={disabled}
                            />
                            <TextInput
                                {...register('device_battery_maximum', {
                                    setValueAs: (v) => v === "" || isNaN(v) ? undefined : Number(v)
                                })}
                                label="Device Battery Maximum"
                                description="Only include data from devices with battery levels up to this value."
                                type="number"
                                error={formState.errors.device_battery_maximum?.message}
                                disabled={disabled}
                            />
                        </div>
                        <div className="flex flex-col gap-5 @md:grid @md:grid-cols-2 @md:items-end">
                            <TextInput
                                {...register('device_storage_mininum', {
                                    setValueAs: (v) => v === "" || isNaN(v) ? undefined : Number(v)
                                })}
                                label="Device Storage Mininum"
                                description="Filter for devices with at least this amount of available storage."
                                type="number"
                                error={formState.errors.device_storage_mininum?.message}
                                disabled={disabled}
                            />
                            <TextInput
                                {...register('device_storage_maximum', {
                                    setValueAs: (v) => v === "" || isNaN(v) ? undefined : Number(v)
                                })}
                                label="Device Storage Maximum"
                                description="Filter for devices with storage up to this level."
                                type="number"
                                error={formState.errors.device_storage_maximum?.message}
                                disabled={disabled}
                            />
                        </div>

                        <CheckboxGroupInput
                            label="Device Status"
                            description="Choose whether to include data from operational devices or devices with errors."
                            error={formState.errors.device_status?.message}
                        >
                            {
                                filterSelections.dStatus.map((selection, idx) =>
                                    <CheckboxGroupItem
                                        {...register('device_status')}
                                        key={`${formName}-vStatus-${selection.value}-${idx}`}
                                        disabled={disabled}
                                        value={selection.value}
                                    >
                                        {selection.label}
                                    </CheckboxGroupItem>
                                )
                            }
                        </CheckboxGroupInput>
                    </div>
                </div>
            </div>

            <div className="flex flex-row gap-2.5 justify-end">
                <Button type="submit" disabled={query.disabled || !formState.isDirty} size="sm">
                    Query
                </Button>
                {removeFilters ? (
                    <Button size="sm" type="button" onClick={(e) => removeFilters.handler(e)} disabled={removeFilters?.disabled || _.isEqual(formState.defaultValues, CLEARED_STATE)} variant="secondary">
                        Remove Filters
                    </Button>
                ) : undefined}
            </div>
        </form>
    )
}