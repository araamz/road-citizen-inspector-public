export type VisualizationRowProps = {
    title: string;
    value: string;
}
export default function VisualizationRow({
    title,
    value
}: VisualizationRowProps) {
    return (
        <div className="
            py-1
            flex flex-row justify-between items-center gap-5
            border-b border-b-neutral-300
            text-sm font-medium 
        ">
            <p>
                {title}
            </p>
            <p className="text-neutral-500">
                {value}
            </p>
        </div>
    )
}