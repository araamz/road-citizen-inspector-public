import type { ReactElement } from "react";
import Container from "./Container";

export type VisualizationSummaryProps = {
    title: string;
    description: string;
    children: ReactElement;
}
export default function VisualizationSummary({
    title,
    description,
    children
}: VisualizationSummaryProps) {
    return (
        <Container>
            <div className="w-full h-full @container">
                <div className="flex flex-col gap-5 justify-between h-full">
                    <div className="flex flex-col gap-2.5">
                        <p className="font-semibold">
                            {title}
                        </p>
                        <p className="text-sm text-neutral-400">
                            {description}
                        </p>
                    </div>
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </Container>
    )
}