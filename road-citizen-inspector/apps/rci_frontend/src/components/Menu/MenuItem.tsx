import { Menu as BaseMenu } from '@base-ui/react/menu'
import type { MenuItemProps as BaseMenuItemProps } from '@base-ui/react/menu';
import type { IconType } from 'react-icons'

export type MenuItemProps = {
    icon?: IconType
    children: string
} & BaseMenuItemProps
export default function MenuItem({
    icon: Icon,
    children
}: MenuItemProps) {
    return (
        <BaseMenu.Item>
            { Icon ? (
                <span>
                    <Icon />
                </span>
            ) : undefined}
            <p>
                {children}
            </p>
        </BaseMenu.Item>
    )
}