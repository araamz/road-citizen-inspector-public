import { Toggle as BaseToggle } from "@base-ui/react/toggle"
import type {
    ToggleProps as BaseToggleProps
} from "@base-ui/react/toggle"
import type { IconType } from "react-icons";

export type ToggleProps<TToggleValue extends string> = {
    textIcon?: string;
    icon?: IconType;
} & Omit<BaseToggleProps<TToggleValue>, "className" | "nativeButton" | "style" | "render">;

export default function Toggle<TValueType extends string>(props: ToggleProps<TValueType>) {

    const {
        icon: Icon,
        textIcon,
        ...rest
    } = props;

    const Preview = () => {
        if (Icon) return <Icon size={16} />
        else if (textIcon) return <p>{textIcon}</p>
        else throw new Error("Missing Text Fallback and Icon for Toggle.")
    }

    return (
        <BaseToggle {...rest} className="
            w-fit 
            text-sm
            transition-colors 
            hover:bg-neutral-200
            data-pressed:bg-amber-400/15
            data-pressed:text-amber-600
            px-2 py-1 flex-1 rounded-md
            flex items-center justify-center">
            <Preview />
        </BaseToggle>
    )
}