import { twMerge } from "tailwind-merge";
import type { ReactElement } from "react"

export type ContainerProps = {
    children: ReactElement | Array<ReactElement>
    className?: string;
}
export default function Container({
    children,
    className
}: ContainerProps) {
    return (
        <div className={twMerge(`p-10 bg-white rounded-lg border border-neutral-300 flex flex-col`, className)}>
            {children}
        </div>
    )
}