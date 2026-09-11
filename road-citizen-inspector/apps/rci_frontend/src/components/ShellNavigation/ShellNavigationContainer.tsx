import type { ReactElement } from "react"
import type { ShellNavigationItemProps } from "./ShellNavigationItem"
import { twMerge } from "tailwind-merge";

export type ShellNavigationContainerProps = {
    children: ReactElement<ShellNavigationItemProps>[]
    className?: string;
}
export default function ShellNavigationContainer({ children, className }: ShellNavigationContainerProps) {
    return (
        <div className={twMerge(`flex flex-row items-baseline-end gap-4 overflow-x-auto`, className)}>
            {children}
        </div>
    )
}