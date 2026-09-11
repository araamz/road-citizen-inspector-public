import { Link  } from "@tanstack/react-router"
import type {LinkProps} from "@tanstack/react-router";
import type { IconType } from "react-icons";

export type ShellNavigationItemProps = {
    icon: IconType;
    children: string;
} & LinkProps;
export default function ShellNavigationItem({ icon: Icon, children, ...linkProps }: ShellNavigationItemProps) {
    return (
        <Link {...linkProps} className="group transition-colors h-min hover:text-amber-600 data-[status=active]:border-b-amber-600 hover:border-b-amber-600 data-[status=active]:text-amber-600 text-neutral-400 flex flex-row items-center gap-2 px-4 border-b-2 border-b-neutral-300 pb-2">
            <span>
                <Icon />
            </span>
            <p className="text-nowrap font-medium tracking-wider text-sm">
                {children}
            </p>
        </Link>
    )
}