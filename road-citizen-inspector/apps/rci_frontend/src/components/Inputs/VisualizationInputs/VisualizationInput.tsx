import { Input as BaseInput } from "@base-ui/react/input"
import type { InputProps as BaseInputProps } from "@base-ui/react/input";

export type VisualizationInputProps = {
} & BaseInputProps;
export default function VisualizationInput({
    ...rest
}: VisualizationInputProps) {
    return (
        <BaseInput {...rest} className="
            box-border
            w-full
            h-10
            rounded-lg
            border
            border-neutral-300
            bg-white
            placeholder:text-sm
            text-sm
            px-4
            focus:ring-amber-400
            focus:ring-2
            outline-0
            transition-all
        " />
    )
}
