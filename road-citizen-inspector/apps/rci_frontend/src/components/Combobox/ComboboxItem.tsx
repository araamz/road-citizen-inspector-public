import { Combobox as BaseCombobox  } from '@base-ui/react/combobox'
import { HiCheck } from 'react-icons/hi2';
import type {ComboboxItemProps as BaseComboboxItemProps} from '@base-ui/react/combobox';

export type ComboboxItemProps = {
    label: string;
    descriptor?: string;
} & BaseComboboxItemProps;

export default function ComboboxItem({
    label,
    descriptor,
    ...rest
}: ComboboxItemProps) {
    return (
        <BaseCombobox.Item {...rest} className="
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
            px-4 py-1.5 rounded-lg    
        ">
            <div className='min-w-[18px]'>
                <BaseCombobox.ItemIndicator>
                    <HiCheck size={18} />
                </BaseCombobox.ItemIndicator>
            </div>
            <div className=' text-sm flex flex-col'>
                <p className='font-medium'>
                    {label}
                </p>
                {
                    descriptor && (
                        <p className='opacity-50 truncate max-w-fit leading-none text-xs'>
                            {descriptor}
                        </p>
                    )
                }
            </div>
        </BaseCombobox.Item>
    )
}