import {
    Select as BaseSelect
    
}
    from '@base-ui/react/select';
import { HiCheck } from 'react-icons/hi2';
import type {SelectItemProps as BaseSelectItemProps} from '@base-ui/react/select';

export type SelectItemProps = {
    children: string
} & BaseSelectItemProps
export default function SelectItem({
    children,
    ...rest
}: SelectItemProps) {
    return (
        <BaseSelect.Item {...rest} className="
            transition-colors
            data-selected:bg-amber-400/15 
            data-selected:border-amber-600
            data-selected:text-amber-600
            hover:bg-neutral-200
            active:bg-neutral-200
            flex 
            flex-row 
            items-center 
            gap-x-2
            font-medium
            px-4 py-1.5 rounded-lg    
        ">
            <div className='w-[18px]'>
                <BaseSelect.ItemIndicator>
                    <HiCheck size={18} />
                </BaseSelect.ItemIndicator>
            </div> 
            <BaseSelect.ItemText className="text-sm">
                {children}
            </BaseSelect.ItemText>
        </BaseSelect.Item>
    )
}