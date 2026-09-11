import VisualizationDeviceCombobox from "./VisualizationDeviceCombobox";
import VisualizationIntervalSelect from "./VisualizationIntervalSelect";
import VisualizationTimestampField from "./VisualizationTimestampField";
import type { MouseEvent } from "react";
import type { VisualizationDeviceComboboxProps } from "./VisualizationDeviceCombobox";
import type { VisualizationIntervalSelectProps } from "./VisualizationIntervalSelect";
import type { VisualizationTimestampFieldProps } from "./VisualizationTimestampField";
import Button from "@/components/Button";

export type CompositeFiltersInputsProps = {
    intervalProps: VisualizationIntervalSelectProps
    deviceProps: VisualizationDeviceComboboxProps;
    startTimestampProps: VisualizationTimestampFieldProps
    endTimestampProps: VisualizationTimestampFieldProps
    query?: {
        handler: (event: MouseEvent<HTMLButtonElement>) => void
        disabled?: boolean
    }
    reset?: {
        handler: (event: MouseEvent<HTMLButtonElement>) => void,
        disabled?: boolean
    }
}

export default function CompositeFiltersInputs({
    intervalProps,
    deviceProps,
    startTimestampProps,
    endTimestampProps,
    query,
    reset
}: CompositeFiltersInputsProps) {

    return (
        <div className="
            flex flex-col @xl:items-end @xl:flex-row w-full gap-5 @xl:gap-2.5 
        ">
            <VisualizationIntervalSelect widthClassName="@xl:flex-1" {...intervalProps} />
            <VisualizationDeviceCombobox widthClassName="@xl:flex-2" {...deviceProps} />
            <VisualizationTimestampField widthClassName="@xl:shrink" {...startTimestampProps} />
            <VisualizationTimestampField widthClassName="@xl:shrink" {...endTimestampProps} />
            {query || reset ? (
                <div className="h-10 flex justify-end items-center gap-2.5">
                    {
                        query && (
                            <Button disabled={query.disabled} size="sm" onClick={(e) => query.handler(e)}>
                                Query
                            </Button>
                        )
                    }
                    {
                        reset && (
                            <Button disabled={reset.disabled} size="sm" variant="secondary" onClick={(e) => reset.handler(e)}>
                                Reset
                            </Button>
                        )
                    }
                </div>
            ) : undefined}
        </div>
    )
}