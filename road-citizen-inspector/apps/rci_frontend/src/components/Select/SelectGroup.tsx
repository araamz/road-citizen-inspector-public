import {
    Select as BaseSelect
} from '@base-ui/react/select'
import type { SelectGroupProps as BaseSelectGroupProps } from '@base-ui/react/select';
import type { ReactElement } from 'react'
import type { SelectItemProps } from './SelectItem'

export type SelectGroupProps = {
    title: string,
    children: Array<ReactElement<SelectItemProps>>
} & BaseSelectGroupProps
export default function SelectGroup({
    children,
    title,
    ...rest
}: SelectGroupProps) {
    return (
        <BaseSelect.Group {...rest}>
            <BaseSelect.GroupLabel className="
                pl-2 pt-2 pb-1 
                text-xs text-neutral-500 
                border-t border-neutral-300 
                uppercase
            ">
                {title}
            </BaseSelect.GroupLabel>
            <>
                {children}
            </>
        </BaseSelect.Group>
    )
}