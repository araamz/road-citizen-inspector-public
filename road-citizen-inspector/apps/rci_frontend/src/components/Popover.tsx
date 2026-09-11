import { Popover as BasePopover } from "@base-ui/react/popover"
import type { PopoverPositionerProps as BasePopoverPositionerProps, PopoverRootProps as BasePopoverRootProps, PopoverTriggerProps as BasePopoverTriggerProps } from "@base-ui/react/popover"
import type { ReactElement } from "react";

export type PopoverTriggerProps = BasePopoverTriggerProps
export type PopoverPositionerProps = BasePopoverPositionerProps
export type PopoverProps = {
    children: ReactElement;
    widthClassname?: string;
    positionerProps: PopoverPositionerProps;
    triggerProps?: PopoverTriggerProps;
    title: string;
    description: string;
} & BasePopoverRootProps;
export default function Popover({
    children,
    widthClassname,
    positionerProps,
    title,
    triggerProps,
    description,
    ...rest
}: PopoverProps) {
    return (
        <BasePopover.Root {...rest}>
            <BasePopover.Trigger {...triggerProps}>
                {children}
            </BasePopover.Trigger>
            <BasePopover.Portal>
                <BasePopover.Positioner {...positionerProps}>
                    <BasePopover.Popup className={`
                    bg-neutral-800/80 backdrop-blur 
                    p-4 rounded-lg shadow-lg 
                    flex flex-col gap-y-1
                    origin-(--transform-origin)
                    ${widthClassname ? widthClassname : 'max-w-50'}
                    `}>
                        <BasePopover.Title className="text-white text-xs font-medium tracking-wider">
                            {title}
                        </BasePopover.Title>
                        <BasePopover.Description className="text-xs text-white/50 leading-snug">
                            {description}
                        </BasePopover.Description>
                    </BasePopover.Popup>
                </BasePopover.Positioner>
            </BasePopover.Portal>
        </BasePopover.Root>
    )
}