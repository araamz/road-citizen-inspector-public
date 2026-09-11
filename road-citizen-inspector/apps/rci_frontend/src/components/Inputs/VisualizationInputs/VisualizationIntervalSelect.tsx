import Select from "../../Select/Select";
import SelectItem from "../../Select/SelectItem";
import VisualizationField from "./VisualizationField";
import type { SelectPositionerProps } from "../../Select/Select";

export type VisualizationInterval = {
    value: string;
    label: string;
    interval: number;
}

const VISUALIZATION_INTERVAL: Array<VisualizationInterval> = [
    {
        value: '60',
        label: '60 min',
        interval: 60
    },
    {
        value: '30',
        label: '30 min',
        interval: 30
    },
    {
        value: '15',
        label: '15 min',
        interval: 15
    }
]

export type VisualizationIntervalSelectProps = {
    widthClassName?: string;
    intervals?: Array<VisualizationInterval>;
    intervalValue: VisualizationInterval;
    setInterval: (interval: VisualizationInterval) => void
    position?: SelectPositionerProps;
}
export default function VisualizationIntervalSelect({
    widthClassName,
    intervals = VISUALIZATION_INTERVAL,
    intervalValue,
    setInterval,
    position
}: VisualizationIntervalSelectProps) {

    const renderTriggerPreview = (value: VisualizationInterval) => {
        return intervals.find((interval) => interval.value === value.value)?.label ?? "NA"
    }

    return (
        <VisualizationField widthClassName={widthClassName} label="Interval Selector" description="Select the data interval for granular summaries.">
            <Select<VisualizationInterval, false>
                widthClassName={widthClassName}
                triggerRender={renderTriggerPreview}
                value={intervalValue}
                onValueChange={(v) => v && setInterval(v)}
                positionerProps={{
                    ...position
                }}

                isItemEqualToValue={(i, v) => i.value === v.value}
                itemToStringValue={(v) => v.value}
            >
                {intervals.map((interval) =>
                    <SelectItem key={interval.value} value={interval}>
                        {interval.label}
                    </SelectItem>
                )}
            </Select >
        </VisualizationField>
    )
}