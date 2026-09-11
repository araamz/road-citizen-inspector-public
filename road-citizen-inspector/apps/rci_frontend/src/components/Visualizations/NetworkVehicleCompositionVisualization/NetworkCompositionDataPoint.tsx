export type NetworkCompositionDataPointProps = {
    vehicleType: string;
    percentage: number;
    count: number
}
export default function NetworkCompositionDataPoint({
    vehicleType,
    percentage,
    count
}: NetworkCompositionDataPointProps) {
    return (
        <div className="flex flex-col gap-0.5">
            <p className="text-neutral-400 tracking-wider font-medium uppercase text-xs">
                {vehicleType}
            </p>
            <div>
                <p className="text-2xl">
                    {percentage}%
                </p>
                <p className="font-medium leading-tight text-sm">
                    {count.toLocaleString()} vehicles
                </p>
            </div>
        </div>
    )
}
