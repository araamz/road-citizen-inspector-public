import VisualizationField from "./VisualizationField";
import VisualizationInput from "./VisualizationInput";

export type VisualizationTimestampFieldProps = {
    timestampValue: string;
    setTimestamp: (timestamp: string) => void
    label: string;
    description: string;
    widthClassName?: string;
}
export default function VisualizationTimestampField({
    timestampValue,
    setTimestamp,
    label,
    description,
    widthClassName,
}: VisualizationTimestampFieldProps) {
    return (
        <VisualizationField widthClassName={widthClassName} label={label} description={description}>
            <VisualizationInput onChange={(event) => setTimestamp(event.target.value)} value={timestampValue} type="datetime-local" />
        </VisualizationField>
    )
}