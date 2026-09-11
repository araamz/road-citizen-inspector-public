import { useMemo } from "react";
import VisualizationBandSection from "../../VisualizationBandPreview/VisualizationBandSection";
import CompositeDeviceContribution from "./CompositeDeviceContribution";
import type { CompositeBin } from "@road-citizen-inspector/visualization"
import VisualizationMeter from "@/components/Visualizations/VisualizationMeter";

export type CompositeIntervalDeviceContributionProps = {
    contributionBin: CompositeBin['processed']['contributionCounts'];
    binVehicleCount: number
}
export default function CompositeIntervalDeviceContribution({
    contributionBin,
    binVehicleCount
}: CompositeIntervalDeviceContributionProps) {

    const sortedBin = useMemo(() => contributionBin.sort((a, b) => b.count - a.count), [contributionBin])

    const previewMetadata = useMemo(() => {
        const topBin = sortedBin[0]

        const percentage = ((topBin.count / binVehicleCount) * 100).toFixed(0)

        return {
            count: topBin.count,
            label: topBin.device.label ? topBin.device.label : topBin.device.tts_device_id,
            percentage
        }
    }, [sortedBin, binVehicleCount])

    const statusMessage = () => (
        `Top Device: ${previewMetadata.label} - ${previewMetadata.count} Vehicles`
    )

    const ContributionPreview = () => (
        <div className="flex flex-col gap-0.5 min-w-12 max-w-fit">
            <div className="flex justify-between gap-1.5 text-xs">
                <p className="font-semibold">
                    {previewMetadata.percentage}%
                </p>
                <p className="text-neutral-500">
                    {previewMetadata.count.toLocaleString()}
                </p>
            </div>
            <div className="h-1">
                <VisualizationMeter
                    min={0} max={binVehicleCount}
                    value={previewMetadata.count} showLabel={false}
                    backgroundColorClassname="bg-amber-400"
                />
            </div>
        </div>
    )

    return (
        <VisualizationBandSection
            label="Device Contribution"
            description="View devices that contributed to the overall transportation network within a interval."
            preview={{
                thumbnail: <ContributionPreview />,
                status: statusMessage()
            }}
        >
            <div
                className="
                flex flex-col
            "
            >
                <div className="
                    flex flex-col gap-5
                    @md:grid @md:grid-cols-2
                ">
                    {
                        sortedBin.map((c) =>
                            <CompositeDeviceContribution
                                contribution={c}
                                binVehicleCount={binVehicleCount}
                                key={`composite-device-contribution-${c.device.device_id}`}
                            />
                        )
                    }
                </div>
            </div>
        </VisualizationBandSection>
    )
}