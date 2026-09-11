import { Select as BaseSelect  } from '@base-ui/react/select';
import { HiChevronDown } from 'react-icons/hi2';
import type { SelectPositionerProps as BaseSelectPositionerProps, SelectRootProps as BaseSelectRootProps} from '@base-ui/react/select';
import type { ReactElement } from 'react';
import type { SelectItemProps } from './SelectItem';
import type { SelectGroupProps } from './SelectGroup';

export type SelectPositionerProps = BaseSelectPositionerProps;
export type SelectProps<TSelectValue, TSelectMultiple extends boolean> = {
    widthClassName?: string;
    triggerRender?: (value: TSelectValue) => string;
    children: Array<ReactElement<SelectItemProps>> & Array<ReactElement<SelectGroupProps>>,
    positionerProps?: SelectPositionerProps
} & BaseSelectRootProps<TSelectValue, TSelectMultiple>;

export default function Select<TSelectValue, TSelectMultiple extends boolean>(
    { triggerRender, positionerProps, children, ...rest }: SelectProps<TSelectValue, TSelectMultiple>
) {

    return (
        <BaseSelect.Root<TSelectValue, TSelectMultiple> {...rest}>
            <BaseSelect.Trigger
                className="h-10 w-full flex items-center bg-white rounded-lg border border-neutral-300 justify-between px-4
                    outline-0 focus:ring-amber-400 focus:ring-2 transition-all
                "
            >
                <BaseSelect.Value className="text-sm">
                    {
                        (value) => triggerRender ? triggerRender(value) : value
                    }
                </BaseSelect.Value>
                <BaseSelect.Icon>
                    <HiChevronDown />
                </BaseSelect.Icon>
            </BaseSelect.Trigger>
            <BaseSelect.Portal>
                <BaseSelect.Positioner className="z-100" alignItemWithTrigger={false} side='bottom' sideOffset={4} {...positionerProps}>
                    <BaseSelect.Popup className='
                    w-(--anchor-width)
                    bg-white/90 
                    backdrop-blur-sm 
                    px-2 py-2 rounded-lg shadow-lg 
                    border border-neutral-300
                    '>
                        <BaseSelect.List className="flex flex-col gap-y-1">
                            {children}
                        </BaseSelect.List>
                    </BaseSelect.Popup>
                </BaseSelect.Positioner>
            </BaseSelect.Portal>
        </BaseSelect.Root >
    )
}