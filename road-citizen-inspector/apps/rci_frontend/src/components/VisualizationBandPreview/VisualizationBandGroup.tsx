import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { AccordionRootProps as BaseAccordionRootProps } from '@base-ui/react/accordion';
import type { VisualizationBandItemProps } from "./VisualizationBandItem"
import type { ReactElement } from 'react';

export type VisualziationBandGroupProps<TBandProps extends VisualizationBandItemProps> = {
    children: Array<ReactElement<TBandProps>>
} & BaseAccordionRootProps
export default function VisualziationBandGroup<TBandProps extends VisualizationBandItemProps>({
    children,
    ...rest
}: VisualziationBandGroupProps<TBandProps>) {

    return (
        <BaseAccordion.Root
            className="@container w-full"
            {...rest}
        >
            {children}
        </BaseAccordion.Root>
    )

}