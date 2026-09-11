import type { FragmentProps, ReactElement } from "react";

export type VisualizationChicletProps = {
    label: string;
    children: ReactElement<FragmentProps>;
}
export default function VisualizationChiclet({
    label,
    children
}: VisualizationChicletProps) {
    return (
        <div className="flex flex-col">
            <p className="text-neutral-400 tracking-wider font-medium uppercase text-xs">
                {label}
            </p>
            <p>
                {children}
            </p>
        </div>
    )
}