export type DeviceDataMetricProps = {
    type: 'reading' | 'status',
    value: string;
}
export default function DeviceDataMetric({
    type,
    value
}: DeviceDataMetricProps) {

    const processedLabel = () => {
        if (type === 'reading') return "Readings"
        return "Status"
    }

    return (
        <div className="flex flex-col items-center gap-0.5">
            <p className="
                leading-none tracking-wider text-sm text-amber-600 font-medium
            ">
                {processedLabel()}
            </p>
            <p className="font-medium">
                {value}
            </p>
        </div>
    )
}