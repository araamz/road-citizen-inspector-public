import type { IconType } from "react-icons";
import Tooltip from "@/components/Tooltip";

export type DataPointCharmProps = {
    label: string;
    value: string;
    icon: IconType
}
export default function DataPointCharm({
    label,
    value,
    icon: Icon
}: DataPointCharmProps) {
    return (
        <Tooltip 
            label={label}
            contentOptions={{
                side: 'bottom',
                align: 'center'
            }}
        >
            <div className="
                bg-neutral-200 
                flex items-center gap-1.5 px-1.5 py-1 rounded-md
            ">
                <span>
                    <Icon size={12} />
                </span>
                <p className="font-medium text-sm">
                    {value}
                </p>
            </div>
        </Tooltip>
    )
}