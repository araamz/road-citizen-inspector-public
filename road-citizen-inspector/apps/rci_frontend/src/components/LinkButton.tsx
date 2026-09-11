import { Link  } from "@tanstack/react-router"
import type {LinkProps} from "@tanstack/react-router";
import type { IconType } from "react-icons"

export type LinkButtonProps = {
    startIcon?: IconType
    children: string | Array<string>,
} & LinkProps
export default function LinkButton({
    startIcon: StartIcon,
    children,
    ...rest
}: LinkButtonProps) {

    return (
        <Link
            className="
                transition-all
                inline-flex items-center gap-1
                text-neutral-500
                hover:text-amber-500
                hover:underline
                underline-offset-4
            "
            {...rest}
        >
            {StartIcon && (
                <span>
                    <StartIcon size={14} />
                </span>
            )}
            <p className="text-sm">
                {children}
            </p>
        </Link>
    )
}