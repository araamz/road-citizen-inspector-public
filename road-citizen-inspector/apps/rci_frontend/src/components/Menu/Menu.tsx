import { Menu as BaseMenu } from '@base-ui/react/menu'
import { HiChevronDown } from 'react-icons/hi2';
import type { MenuPositionerState as BaseMenuPositionerState, MenuRootProps as BaseMenuRootProps } from '@base-ui/react/menu';
import type { ReactElement } from 'react';
import type { MenuItemProps } from './MenuItem';
import type { MenuSeperatorProps } from './MenuSeperator';

export type MenuProps = {
    label: string;
    children: Array<ReactElement<MenuItemProps | MenuSeperatorProps>>
    positioning?: BaseMenuPositionerState
} & BaseMenuRootProps;
export default function Menu({
    label,
    children,
    positioning
}: MenuProps) {
    return (
        <BaseMenu.Root>
            <BaseMenu.Trigger>
                <p>
                    {label}
                </p>
                <span>
                    <HiChevronDown />
                </span>
            </BaseMenu.Trigger>
            <BaseMenu.Portal>
                <BaseMenu.Positioner
                    {...positioning}
                >
                    <BaseMenu.Popup>
                        {children}
                    </BaseMenu.Popup>
                </BaseMenu.Positioner>
            </BaseMenu.Portal>
        </BaseMenu.Root>
    )
}