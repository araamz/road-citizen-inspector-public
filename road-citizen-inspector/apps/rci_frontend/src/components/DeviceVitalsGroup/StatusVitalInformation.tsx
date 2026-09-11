export type StatusVitalInformationProps = {
    metric: {
        value: string | number;
        text: string;
        type: 'error' | 'warning' | 'normal'
    }
    description: string;
    lastUpdated: Date
}
export default function StatusVitalInformation({
    metric,
    description,
    lastUpdated
}: StatusVitalInformationProps) {

    const metricColor = () => {
        if (metric.type === 'error') return 'red-600'
        if (metric.type === 'warning') return 'orange-600'
        return 'green-600'
    }

    return (
        <div className="max-w-40 flex flex-col gap-2">
            <div className="border-b border-b-neutral-200 pb-2">
                <p className={`
                        text-3xl font-medium leading-tight ${`text-${metricColor()}`}
                    `}>
                    {metric.value}
                </p>
                <p className={`text-xs font-medium tracking-wider ${`text-${metricColor()}`}`}>
                    {metric.text}
                </p>
            </div>
            <p className="text-sm">
                {description}
            </p>
            <p className="text-xs text-neutral-500">
                Last Updated on {lastUpdated.toLocaleString()}
            </p>
        </div>
    )
}