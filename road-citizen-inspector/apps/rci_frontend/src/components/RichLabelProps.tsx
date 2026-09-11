import { HiOutlineInformationCircle } from "react-icons/hi2";
import Popover, { type PopoverPositionerProps } from "./Popover";

export type RichLabelProps = {
    label: string;
    description?: string;
    position?: PopoverPositionerProps;
}
export default function RichLabel({
    label,
    description,
    position
}: RichLabelProps) {
    return (
        <div className="flex flex-row items-center gap-x-1 text-neutral-500">
            <p className="text-xs font-medium text-neutral-500 tracking-wider text-nowrap">
                {label}
            </p>
            {
                description && (
                    <Popover title={label} description={description} 
                    positionerProps={{
                        side: 'bottom',
                        sideOffset: 4,
                        ...position
                    }}
                    triggerProps={{
                        openOnHover: true,
                        closeDelay: 250
                    }}>
                        <HiOutlineInformationCircle size={16} />
                    </Popover>  
                )
            }
        </div>
    )
}