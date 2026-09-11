import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { HiChevronDown, HiXMark } from 'react-icons/hi2';
import type { ComboboxPositionerProps as BaseComboboxPositionerProps, ComboboxRootProps as BaseComboboxRootProps } from '@base-ui/react/combobox';
import type { ReactElement } from 'react';
import type { ComboboxItemProps } from './ComboboxItem';
import type { ComboboxGroupProps } from './ComboboxGroup';

export type ComboboxPositionerProps = BaseComboboxPositionerProps;
export type ComboboxProps<TItemValue, TMuliple extends boolean> = {
    children: Array<ReactElement<ComboboxItemProps> | null> | Array<ReactElement<ComboboxGroupProps> | null>
    emptyMessage: string;
    placeholder?: string;
    positionerProps?: ComboboxPositionerProps;
} & BaseComboboxRootProps<TItemValue, TMuliple>
export default function Combobox<TItemValue, TMuliple extends boolean>({
    children,
    placeholder,
    emptyMessage,
    positionerProps,
    ...rest
}: ComboboxProps<TItemValue, TMuliple>) {
    return (
        <BaseCombobox.Root {...rest}>
            <div className="relative box-border">
                <BaseCombobox.Input placeholder={placeholder}
                    className="
                    box-border
                    pl-4
                    w-full
                    h-10
                    rounded-lg
                    border
                    border-neutral-300
                    bg-white
                    placeholder:text-sm
                    outline-0
                    focus:ring-amber-400
                    focus:ring-2
                    transition-all
                " />
                <div className="
                    box-content 
                    flex gap-1 
                    absolute h-6 bottom-2 right-0.5 px-3
                    bg-linear-to-r from-0% to-10% from-transparent to-white
                ">
                    <BaseCombobox.Clear>
                        <HiXMark className='opacity-50' aria-label='Clear Device Selections' />
                    </BaseCombobox.Clear>
                    <BaseCombobox.Trigger>
                        <HiChevronDown className='opacity-50' aria-label='Select Device Selections' />
                    </BaseCombobox.Trigger>
                </div>
            </div>
            <BaseCombobox.Portal>
                <BaseCombobox.Positioner className="z-100" side="bottom" sideOffset={8} {...positionerProps}>
                    <BaseCombobox.Popup className="w-(--anchor-width) bg-white/90 backdrop-blur-sm px-2 py-2 rounded-lg shadow-lg border border-neutral-300 origin-(--transform-origin)">
                        <BaseCombobox.Empty>
                            <p className="text-neutral-500 text-xs py-2 font-medium text-center">
                                {emptyMessage}
                            </p>
                        </BaseCombobox.Empty>
                        <BaseCombobox.List className="flex flex-col gap-y-1">
                            {children}
                        </BaseCombobox.List>
                    </BaseCombobox.Popup>
                </BaseCombobox.Positioner>
            </BaseCombobox.Portal>
        </BaseCombobox.Root>
    )
}