import { Combobox as BaseCombobox } from "@base-ui/react/combobox"
import type { ComboboxGroupProps as BaseComboboxGroupProps } from "@base-ui/react/combobox";
import type { ReactElement } from "react";
import type { ComboboxItemProps } from "./ComboboxItem";

export type ComboboxGroupProps = {
    title: string;
    children: Array<ReactElement<ComboboxItemProps>>
} & BaseComboboxGroupProps;
export default function ComboboxGroup({
    title,
    children,
    ...rest
}: ComboboxGroupProps) {
    return (
        <BaseCombobox.Group {...rest}>
            <div className="pb-0.5">
                <BaseCombobox.GroupLabel className="
                ml-10
                text-xs text-neutral-500 
                uppercase font-semibold
            ">
                    {title}
                </BaseCombobox.GroupLabel>
            </div>
            <div className="flex flex-col gap-1">
                {children}
            </div>
        </BaseCombobox.Group>
    )
}