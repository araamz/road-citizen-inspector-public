import type { ReactElement } from "react"
import type { OptionItemProps } from "./OptionItem"

export type OptionGroupProps = {
    children: Array<ReactElement<OptionItemProps>> | ReactElement<OptionItemProps>
}

export default function OptionGroup({children}: OptionGroupProps) {
    return (
        <section className="flex flex-col gap-0.5 py-1">
            {children}
        </section>
    )
}