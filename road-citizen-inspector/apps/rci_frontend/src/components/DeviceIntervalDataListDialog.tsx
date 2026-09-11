import Dialog from "./Dialog";
import DeviceDataPointItem from "./DeviceBandPreview/DeviceIntervalDeviceSummary/DeviceDataPointItem/DeviceDataPointItem";
import type { ReactElement } from "react";
import type { DeviceDataSource } from "@road-citizen-inspector/visualization";
import useDateFormatter from "@/hooks/utilities/useDateFormatter";

export type DeviceIntervalDataListDialogProps = {
    data: Array<DeviceDataSource>
    children: ReactElement;
    intervalStart: Date,
    intervalEnd: Date
}
export default function DeviceIntervalDataListDialog({
    data,
    children,
    intervalStart,
    intervalEnd
}: DeviceIntervalDataListDialogProps) {


    const { renderHourly } = useDateFormatter()


    return (
        <Dialog
            trigger={children}
            title={`Data Summary (${renderHourly(intervalStart)} - ${renderHourly(intervalEnd)})`}
            description="A detailed timeline of all detections and device updates during this period, including vehicle type, speed, direction, and system status."
        >
            <div className="flex flex-col">
                {data.map((ds, idx) =>
                    <DeviceDataPointItem
                        key={`device-data-point-item-${idx}-dialog`}
                        index={idx}
                        dataSource={ds}
                    />
                )}
            </div>
        </Dialog>
    )
}