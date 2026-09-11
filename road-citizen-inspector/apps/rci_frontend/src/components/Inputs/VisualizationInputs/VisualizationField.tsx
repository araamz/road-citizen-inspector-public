import { Field as BaseField } from "@base-ui/react/field"
import type { ComboboxProps } from "@/components/Combobox/Combobox";
import type { SelectProps } from "@/components/Select/Select";
import type { ToggleGroupProps } from "@/components/ToggleGroup";
import type { FieldRootProps as BaseFieldRootProps } from "@base-ui/react/field";
import type { ReactElement } from "react";
import type { VisualizationInputProps } from "./VisualizationInput";
import RichLabel from "@/components/RichLabelProps";

export type VisualziationFieldProps = {
    widthClassName?: string;
    children: ReactElement<ComboboxProps<any, any>> | ReactElement<SelectProps<any, any>> | ReactElement<ToggleGroupProps<any>> | ReactElement<VisualizationInputProps>
    label: string;
    description: string;
} & BaseFieldRootProps
export default function VisualizationField({
    children,
    widthClassName,
    label,
    description,
    ...rest
}: VisualziationFieldProps) {
    return (
        <BaseField.Root {...rest} className={`${widthClassName ? widthClassName : "w-full"} flex flex-col gap-y-1`}>
            <BaseField.Label>
                <RichLabel label={label} description={description} />
            </BaseField.Label>
            {children}
        </BaseField.Root>
    )
}