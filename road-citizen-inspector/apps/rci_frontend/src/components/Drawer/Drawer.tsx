import { Drawer as BaseDrawer } from "@base-ui/react/drawer"
import SectionLabel from "../SectionLabel";
import CloseButton from "../CloseButton";
import type { DrawerRootProps as BaseDrawerRootProps, DrawerTriggerProps as BaseDrawerTriggerProps } from "@base-ui/react/drawer";
import type { ReactElement } from "react";

export type DrawerRootProps = BaseDrawerRootProps
export type DrawerTriggerProps = BaseDrawerTriggerProps
export type DrawerProps = {
    title: string;
    description?: string;
    content: ReactElement;
    children: ReactElement;
    triggerProps?: DrawerTriggerProps
    disableBlur?: boolean;
    maxWidthClassName?: string;
} & BaseDrawerRootProps;
export default function Drawer({
    title,
    description,
    content,
    children,
    triggerProps,
    disableBlur,
    maxWidthClassName,
    ...rest
}: DrawerProps & BaseDrawerRootProps) {

    return (
        <BaseDrawer.Root {...rest}>
            <BaseDrawer.Trigger {...triggerProps}>
                {children}
            </BaseDrawer.Trigger>
            <BaseDrawer.Portal>
                <BaseDrawer.Backdrop className={`
                    z-60 
                    fixed top-0 left-0 w-full h-full 
                    bg-black/50 
                    ${disableBlur ? undefined : 'backdrop-blur-md'}
                `} />
                <BaseDrawer.Viewport className={`
                    z-65 fixed 
                    h-full w-3/4 
                    right-0 top-0

                    ${maxWidthClassName ? maxWidthClassName : "max-w-[350px]"}
                `} >
                    <BaseDrawer.Popup className="
                        bg-neutral-100 shadow-lg
                        border-l border-neutral-300 
                        w-full h-full
                    ">
                        <BaseDrawer.Content className="@container/drawer h-full min-h-0">
                            <div
                                data-base-ui-swipe-ignore
                                className="@container/drawer flex h-full min-h-0 flex-col gap-5 overflow-y-auto p-10"
                            >
                                <div className="w-full flex justify-end ">
                                    <BaseDrawer.Close render={<CloseButton />} />
                                </div>
                                <div>
                                    <BaseDrawer.Title render={() =>
                                        <SectionLabel textColor="black" size="lg">
                                            {title}
                                        </SectionLabel>
                                    } />
                                    {
                                        description && (
                                            <BaseDrawer.Description className="
                                            text-base
                                        ">
                                                {description}
                                            </BaseDrawer.Description>
                                        )
                                    }
                                </div>
                                {content}
                            </div>
                        </BaseDrawer.Content>
                    </BaseDrawer.Popup>
                </BaseDrawer.Viewport>
            </BaseDrawer.Portal>

        </BaseDrawer.Root>
    )
}