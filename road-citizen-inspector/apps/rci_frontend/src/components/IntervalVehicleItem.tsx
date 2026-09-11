import ColorGlyph from "@/components/Visualizations/ColorGlyph";

export type IntervalVehicleItemProps = {
    label: string;
    color: string;
    vehiclePercentage: number;
    vehicleCount: number;
}
export default function IntervalVehicleItem({
    label,
    color,
    vehiclePercentage,
    vehicleCount
}: IntervalVehicleItemProps) {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex gap-1.5 items-center">
                <ColorGlyph size={12} radius={2.5} color={color} />
                <p className="uppercase font-medium text-xs">
                    {label}
                </p>
            </div>
            <div className="flex flex-col gap-1.5">
                <p className="text-xl font-medium">
                    {vehiclePercentage.toFixed(0)}%
                </p>
                <p className="text-xs font-medium text-neutral-500 leading-0">
                    {vehicleCount} Vehicles
                </p>
            </div>
        </div>
    )
}   