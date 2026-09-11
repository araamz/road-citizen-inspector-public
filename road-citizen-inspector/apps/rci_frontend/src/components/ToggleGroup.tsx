import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group"
import type { ToggleProps } from "./Toggle"
import type { ToggleGroupProps as BaseToggleGroupProps } from "@base-ui/react/toggle-group"

export type ToggleGroupProps<TValueType extends string> = {
    children: Array<ToggleProps<TValueType>>,
} & BaseToggleGroupProps<TValueType>;
export default function ToggleGroup<TValueType extends string>(props: ToggleGroupProps<TValueType>) {

    const { children, ...rest } = props;  

    return (
        <BaseToggleGroup {...rest} className={`
            h-10 
            bg-white border border-neutral-300 rounded-lg

            flex
            items-center
            justify-center
            p-2
            gap-x-1.5
        `}>
            { children }
        </BaseToggleGroup>
    )
}