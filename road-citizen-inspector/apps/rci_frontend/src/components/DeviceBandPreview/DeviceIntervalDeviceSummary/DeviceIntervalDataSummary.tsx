import { useMemo } from "react";
import { HiLink, HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import { LuGauge } from 'react-icons/lu'
import { FaCar } from "react-icons/fa";
import VisualizationBandSection from "../../VisualizationBandPreview/VisualizationBandSection";
import DeviceDataMetric from "./DeviceDataMetric";
import DeviceStatusMetric from "./DeviceStatusMetric";
import DeviceDataPointItem from "./DeviceDataPointItem/DeviceDataPointItem";
import type { DeviceDataMetricProps } from "./DeviceDataMetric";
import type { DeviceBin } from "@road-citizen-inspector/visualization";
import Note from "@/components/Note";
import Button from "@/components/Button";

import LinkButton from "@/components/LinkButton";
import DeviceIntervalDataListDialog from "@/components/DeviceIntervalDataListDialog";
import Badge from "@/components/Badge";
import Tooltip from "@/components/Tooltip";

export type DeviceIntervalDataSummaryProps = {
    deviceId: number;
    intervalStart: Date,
    intervalEnd: Date,
    data: DeviceBin['data']
    previewCount?: number
}
export default function DeviceIntervalDataSummary({
    deviceId,
    intervalEnd,
    intervalStart,
    previewCount = 10,
    data
}: DeviceIntervalDataSummaryProps) {

    const aggregatedData = useMemo(() => {
        const status = data ? (
            data.filter((ds) => ds.type === "status")
        ) : []
        const reading = data ? (
            data.filter((ds) => ds.type === "reading")
        ) : []

        return {
            status,
            reading
        }
    }, [data])

    const metricsMetadata = () => {

        const readingMetric: DeviceDataMetricProps = {
            type: "reading",
            value: aggregatedData.reading.length.toLocaleString()
        }

        const statusMetric: DeviceDataMetricProps = {
            type: "status",
            value: aggregatedData.status.length.toLocaleString()
        }

        return [readingMetric, statusMetric]
    }

    const statusMetadata = useMemo(() => {
        if (aggregatedData.status.length === 0) return null

        const latestStatus = aggregatedData.status.reduce((acc, s) => {
            if (new Date(acc.status.status_capture_time) < new Date(s.status.status_capture_time)) return s;
            return acc;

        }, aggregatedData.status[0])

        return latestStatus;
    }, [aggregatedData.status])

    const DataSummaryPreview = () => {
        return (
            <div className="flex gap-2.5">
                <Tooltip
                    label="Reading Counts"
                    contentOptions={{
                        side: 'bottom',
                        align: 'center'
                    }}
                >
                    <span>
                        <Badge icon={FaCar} label={aggregatedData.reading.length.toLocaleString()} />
                    </span>
                </Tooltip>
                <Tooltip
                    label="Status Counts"
                    contentOptions={{
                        side: 'bottom',
                        align: 'center'
                    }}
                >
                    <span>
                        <Badge icon={LuGauge} label={aggregatedData.status.length.toString()} />
                    </span>
                </Tooltip>
            </div>
        )
    }

    const statusMessage = () => {
        if (statusMetadata) return (
            `${aggregatedData.reading.length} Vehicles, Battery: ${statusMetadata.status.device_battery_level.toLocaleString()}%, Storage: ${statusMetadata.status.device_storage_level}%`
        )
        else return (
            `${aggregatedData.reading.length} Vehicles`
        )
    }

    return (
        <VisualizationBandSection
            label="Data Summary"
            description="View a detailed timeline of device messages such as vehicle detection readings and device status information."
            preview={{
                thumbnail: <DataSummaryPreview />,
                status: statusMessage()
            }}
            disabled={!data}
        >
            <div className="flex flex-col gap-2.5">
                {statusMetadata !== null ? (
                    <div className="w-full @container">
                        <div className="flex flex-row items-center flex-wrap justify-center gap-1.5">
                            <div className="flex flex-row gap-x-2.5 justify-around">
                                <DeviceStatusMetric status={statusMetadata.status} type="battery" />
                                <DeviceStatusMetric status={statusMetadata.status} type="storage" />
                                <DeviceStatusMetric status={statusMetadata.status} type="state" />
                            </div>
                            <p className="font-medium text-neutral-500 text-sm text-center italic">
                                Recorded at {new Date(statusMetadata.status.status_capture_time).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ) : (
                    <Note type="urgent" >
                        <p>
                            Failed to load interval's latest status information.
                        </p>
                    </Note>
                )}
                <div className="grid grid-cols-2">
                    {
                        metricsMetadata().map((metric) =>
                            <DeviceDataMetric
                                key={`device-data-metric-${metric.type}`}
                                {...metric}
                            />
                        )
                    }
                </div>
                {
                    data ? (
                        <div className="flex flex-col gap-2.5 items-center">
                            <div className="w-full">
                                {data.slice(0, previewCount).map((ds, idx) =>
                                    <DeviceDataPointItem
                                        key={`device-data-point-item-${idx}`}
                                        dataSource={ds}
                                    />
                                )}
                            </div>
                            {
                                (data.length - previewCount) > 0 ? (
                                    <DeviceIntervalDataListDialog
                                        data={data}
                                        intervalStart={intervalStart}
                                        intervalEnd={intervalEnd}
                                    >
                                        <Button startIcon={HiOutlineArrowTopRightOnSquare} size="sm">
                                            See  All {(data.length - 10).toLocaleString()} Messages
                                        </Button>
                                    </DeviceIntervalDataListDialog>
                                ) : undefined
                            }
                            <div className="flex flex-col w-full items-center gap-2.5">
                                <LinkButton
                                    startIcon={HiLink}
                                    to="/session/$sessionId/records/readings"
                                    search={{
                                        start: intervalStart.toISOString(),
                                        end: intervalStart.toISOString(),
                                        device_ids: [deviceId]
                                    }}
                                >
                                    View in Reading Records
                                </LinkButton>
                                <LinkButton
                                    to="/session/$sessionId/records/status"
                                    search={{
                                        start: intervalStart.toISOString(),
                                        end: intervalStart.toISOString(),
                                        device_ids: [deviceId]
                                    }}
                                    startIcon={HiLink}
                                >
                                    View in Status Records
                                </LinkButton>
                            </div>
                        </div>
                    ) : (
                        <Note type="urgent">
                            <p>
                                There was rendering device messages for the interval. Please try again later.
                            </p>
                        </Note>
                    )
                }
            </div>
        </VisualizationBandSection>
    )
}