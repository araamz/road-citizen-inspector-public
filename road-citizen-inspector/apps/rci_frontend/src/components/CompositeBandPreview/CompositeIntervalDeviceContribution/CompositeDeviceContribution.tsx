import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {  useMemo } from "react";
import type { ContributionBreakdown } from "@road-citizen-inspector/visualization";
import type {ReactElement} from "react";
import Note from "@/components/Note";
import RoadConfigurationLabel from "@/components/RoadConfigurationLabel";
import Skeleton from "@/components/Skeleton";
import VisualizationMeter from "@/components/Visualizations/VisualizationMeter";
import useDeviceConfigurationOptions from "@/hooks/queries/device/UseDeviceConfigurationOptions";

export type CompositeDeviceContributionProps = {
    contribution: ContributionBreakdown;
    binVehicleCount: number;
}
export default function CompositeDeviceContribution({
    contribution,
    binVehicleCount
}: CompositeDeviceContributionProps) {

    const contributionPercentage = useMemo(() => `${Math.round((contribution.count / binVehicleCount) * 100)}%`, [contribution.count, binVehicleCount])

    const { data: config, error: configError, isPending: configPending } = useQuery(
        useDeviceConfigurationOptions(contribution.device.device_id)
    )

    const deviceConfiguration: ReactElement = useMemo(() => {
        if (configPending) return <></>;
        console.log("config", config)

        if (config) 
            return <RoadConfigurationLabel configuration={config.configuration} />
        return (
            <Note type="urgent">
                <p>
                    <span className="font-semibold"> Error! </span> {configError?.message}
                </p>
            </Note>
        )
    }, [config, configError, configPending])

    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-end">
                <p className="text-2xl font-medium">
                    {contributionPercentage}
                </p>
                <p className="text-neutral-400 text-sm">
                    {contribution.count} Vehicles
                </p>
            </div>
            <div className="w-full h-2">
                <VisualizationMeter
                    backgroundColorClassname='bg-amber-400'
                    min={0}
                    max={binVehicleCount}
                    value={binVehicleCount - contribution.count}
                    showLabel={false}
                />
            </div>
            <div className="flex flex-col gap-1">
                <Link
                    to='/session/$sessionId/device/$deviceId'
                    search={(prev) => ({
                        interval: prev.interval,
                        start: prev.start,
                        end: prev.end
                    })}
                    params={(prev) => ({
                        sessionId: prev.sessionId!,
                        deviceId: String(contribution.device.device_id),
                    })}                >
                    <p className="text-sm font-medium truncate hover:text-amber-600 transition-colors">
                        {contribution.device.label ? contribution.device.label : contribution.device.tts_device_id}
                    </p>
                </Link>
                <Skeleton isLoading={configPending} className="w-1/2" height="xs">
                    {deviceConfiguration}
                </Skeleton>
            </div>
        </div>
    )
}