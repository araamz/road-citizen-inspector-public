import {
    Popover as BasePopover
} from "@base-ui/react"
import IconPlaceholder from "../IconPlaceholder";
import type {PopoverPositionerProps as BasePopoverPositionerProps, PopoverRootProps as BasePopoverRootProps} from "@base-ui/react";
import type { ReactElement } from "react";
import type { IconType } from "react-icons";

export type DeviceVitalProps = {
    icon: IconType,
    label: string;
    children: ReactElement;
    popover?: {
        rootProps?: BasePopoverRootProps
        positionerProps?: BasePopoverPositionerProps
    }
}
export default function DeviceVital({
    icon: Icon,
    label,
    children,
    popover
}: DeviceVitalProps) {

    // const { data: deviceStatus, isPending: deviceStatusPending, error: deviceStatusError } = useQuery(
    //     useLatestDeviceStatusOptions(deviceId)
    // )

    return (
        <BasePopover.Root
            modal
            {...popover?.rootProps}
        >
            <div className="
                flex flex-row gap-2.5 items-center
                bg-white h-10 px-3.5 
                border border-neutral-300 rounded-md
            ">
                <div className="flex flex-row items-center gap-1.5">
                    <span>
                        <Icon />
                    </span>
                    <p className="
                        text-xs font-medium text-nowrap hidden @md:block
                    ">
                        {label}
                    </p>
                </div>
                <BasePopover.Trigger className="group">
                    <IconPlaceholder
                        className="group-data-popup-open:text-black group-data-popup-open:bg-neutral-200"
                        size="xs"
                        tooltipOptions={{
                            label: "View More",
                            contentOptions: {
                                side: "bottom"
                            }
                        }}
                    />
                </BasePopover.Trigger>
            </div>
            <BasePopover.Portal>
                <BasePopover.Positioner
                    {...popover?.positionerProps}
                    align="center"
                    side="bottom"
                    sideOffset={15}
                >
                    <BasePopover.Popup
                        className="
                            w-full
                            bg-white/90 backdrop-blur-sm p-5
                            rounded-md border border-neutral-200
                            drop-shadow-xl
                        "
                    >
                        <>
                            {children}
                        </>
                    </BasePopover.Popup>

                </BasePopover.Positioner>
            </BasePopover.Portal>
        </BasePopover.Root>
    )
}