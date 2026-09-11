import { useMemo, useState } from "react";
import ComboboxItem from "../../Combobox/ComboboxItem"
import ComboboxGroup from "../../Combobox/ComboboxGroup";
import ComboboxSeparator from "../../Combobox/ComboboxSeparator";
import type { ComboboxPositionerProps } from "@/components/Combobox/Combobox";
import Combobox from "@/components/Combobox/Combobox"
import VisualizationField from "./VisualizationField";

export type VisualizationDevice = {
    label?: string;
    deviceId: number;
    isPinned: boolean;
    ttsDeviceId: string;
    configurationString?: string;
}
export type VisualizationDeviceComboboxProps = {
    devices: Array<VisualizationDevice>
    selectedDevices: Array<VisualizationDevice>
    setSelectedDevices: (devices: Array<VisualizationDevice>) => void,
    position?: ComboboxPositionerProps;
    widthClassName?: string;
    disabled?: boolean;
};
export default function VisualizationDeviceCombobox({
    devices,
    selectedDevices,
    setSelectedDevices,
    position,
    widthClassName,
    disabled
}: VisualizationDeviceComboboxProps) {

    const [query, setQuery] = useState<string>('')

    const pinnedDevices = useMemo(() => {
        return devices.filter((device) => device.isPinned)
    }, [devices])

    const filteredDevices = useMemo(() => {
        return query.trim().length === 0 ? devices : devices.filter((d) => d.label?.toLocaleLowerCase().includes(query.toLowerCase()) || d.ttsDeviceId.toLowerCase().includes(query.toLowerCase()) && d.isPinned == false)
    }, [query, devices])

    // If All Selected = this menas an empty array thus no filtering 
    const placeholderPreview = useMemo(() => {
        if (selectedDevices.length === 0) return "All Selected"
        else return `${selectedDevices.length} Selected`
    }, [selectedDevices, devices])

    return (
        <VisualizationField disabled={disabled} widthClassName={widthClassName} label="Device Selector" description="Select devices from the session to be used for data aggregation and visualization.">
            <Combobox<VisualizationDevice, true>
                modal
                onInputValueChange={(v) => setQuery(v)}
                inputValue={query}
                multiple={true}
                items={devices}
                placeholder={placeholderPreview}
                value={selectedDevices}
                onValueChange={(d) => setSelectedDevices(d)}
                emptyMessage="Devices not found."
                positionerProps={{
                    ...position
                }}
            >
                {query.trim().length === 0 && pinnedDevices.length ? (
                    <>
                        <ComboboxGroup title="PINNED">
                            {
                                pinnedDevices.map((device) =>
                                    <ComboboxItem
                                        key={`VisualizationDeviceSelector-pinned-${device.deviceId}`}
                                        value={device}
                                        label={device.label ?? device.ttsDeviceId}
                                        descriptor={device.configurationString ? device.configurationString : "Awaiting Reading..."}
                                    />
                                )
                            }
                        </ComboboxGroup>
                        <ComboboxSeparator />
                    </>
                ) : null
                }
                <>
                    {
                        filteredDevices.map((device) =>
                            <ComboboxItem
                                key={`VisualizationDeviceSelector-filtered-${device.deviceId}`}
                                value={device}
                                label={device.label ?? device.ttsDeviceId}
                                descriptor={device.configurationString}
                            />
                        )
                    }
                </>
            </Combobox>
        </VisualizationField>
    )
}