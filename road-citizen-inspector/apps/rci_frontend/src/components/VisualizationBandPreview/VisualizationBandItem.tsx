import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { HiChevronDown } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import type { AccordionItemProps as BaseAccordionItemProps } from '@base-ui/react/accordion';
import type { ReactElement } from 'react';
import type { VisualizationBandSectionProps } from './VisualizationBandSection';

export type VisualizationBandItemProps = {
    label: string;
    previewSlot?: ReactElement;
    disabledReason?: string;
    children: ReactElement<VisualizationBandSectionProps> | Array<ReactElement<VisualizationBandSectionProps>>;
} & BaseAccordionItemProps;
export default function VisualizationBandItem({
    label,
    previewSlot,
    children,
    disabledReason,
    ...rest
}: VisualizationBandItemProps) {

    const triggerDisabledClick = () => {
        console.log("pressed")
        if (rest.disabled) toast.error(disabledReason ?  disabledReason : "Interval summary disabled.")
        return
    }

    return (
        <BaseAccordion.Item {...rest} className="
            group
          bg-white 
            border-b border-neutral-300 
            p-2
            first:rounded-t-md last:rounded-b-md border-x first:border-t last:border-b
        "
        onClick={() => triggerDisabledClick()}>
            <BaseAccordion.Header
                className="
                        flex flex-row gap-5 items-center w-full justify-between 
                    ">
                <BaseAccordion.Trigger
                    className="
                        flex items-center 
                        gap-2.5 px-4 py-2 
                        hover:bg-neutral-50 active:bg-neutral-100 
                        transition-colors rounded-md
                        group
                    "
                >
                    <span className='group-data-disabled:invisible group-data-panel-open:rotate-180 transition-transform'>
                        <HiChevronDown />
                    </span>
                    <p className='text-left'>
                        {label}
                    </p>
                </BaseAccordion.Trigger>
                <div className='shrink'>
                    {previewSlot}
                </div>

            </BaseAccordion.Header>
            <BaseAccordion.Panel className="flex flex-col p-5 gap-2.5">
                {children}
            </BaseAccordion.Panel>
        </BaseAccordion.Item>
    )
}