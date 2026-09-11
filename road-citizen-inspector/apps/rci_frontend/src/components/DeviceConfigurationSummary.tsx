import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { HiInformationCircle, HiMiniSignal } from "react-icons/hi2";
import { FaCompass, FaRoad } from "react-icons/fa6";
import Container from "./Container";
import Skeleton from "./Skeleton";
import SectionLabel from "./SectionLabel";
import Note from "./Note";
import LoadingSpinner from "./LoadingSpinner";
import Chiclet from "./Chiclet/Chiclet";
import type { DeviceConfigurationData } from "@road-citizen-inspector/contracts";
import type { IconType } from "react-icons";
import useDeviceConfigurationOptions from "@/hooks/queries/device/UseDeviceConfigurationOptions";

type DeviceMetadataChicletKey = keyof Pick<
    DeviceConfigurationData["device"],
    "project_id" | "tts_device_id" | "origin_uplink_id"
>;

const DEVICE_METADATA_CHICLET_KEYS: Array<DeviceMetadataChicletKey> = [
    "tts_device_id",
    "project_id",
    "origin_uplink_id",
] as const;

type DeviceConfigurationNormalized = NonNullable<DeviceConfigurationData["configuration"]>;

type DeviceConfigurationChicletKey = keyof DeviceConfigurationNormalized;

const DEVICE_CONFIGURATION_CHICLET_KEYS: Array<DeviceConfigurationChicletKey> = [
    "road_primary_direction",
    "road_secondary_direction",
    "road_type",
    "reading_id",
] as const;

type SelectedChiclet<TDataType, TKeyValue extends keyof TDataType> = {
    key: TKeyValue;
    label: string;
    value: TDataType[TKeyValue];
    icon?: IconType
};

export type DeviceConfigurationSummaryProps = {
    deviceId: number;
    informationFlags?: {
        metadata?: Record<DeviceMetadataChicletKey, boolean | undefined>;
        configuration?: Record<DeviceConfigurationChicletKey, boolean | undefined>;
    };
};

export default function DeviceConfigurationSummary({
    deviceId,
    informationFlags,
}: DeviceConfigurationSummaryProps) {
    const {
        data: deviceConfiguration,
        isPending: deviceConfigurationPending,
    } = useQuery(useDeviceConfigurationOptions(deviceId));

    const transformMetadataChiclet = (
        key: DeviceMetadataChicletKey,
    ): SelectedChiclet<DeviceConfigurationData["device"], DeviceMetadataChicletKey> => {
        if (!deviceConfiguration) {
            throw new Error("Failed to index metadata chiclet.");
        }

        switch (key) {
            case "tts_device_id":
                return {
                    key,
                    label: "TTS Device ID",
                    value: deviceConfiguration.device.tts_device_id,
                };
            case "project_id":
                return {
                    key,
                    label: "Project ID",
                    value: deviceConfiguration.device.project_id,
                };
            case "origin_uplink_id":
                return {
                    key,
                    label: "Origin Uplink ID",
                    value: deviceConfiguration.device.origin_uplink_id,
                };
        }
    };

    const transformConfigurationChiclet = (
        key: DeviceConfigurationChicletKey,
    ): SelectedChiclet<DeviceConfigurationNormalized, DeviceConfigurationChicletKey> => {
        if (!deviceConfiguration) {
            throw new Error("Failed to index configuration chiclet.");
        }

        if (deviceConfiguration.configuration === null) {
            throw new Error(
                "Device configuration is null. Unable to index configuration chiclet.",
            );
        }

        const capitalize = (value: string) => {
            if (value.length === 1) return value.toUpperCase()
            return (value.charAt(0).toUpperCase() + value.slice(1));
        }

        switch (key) {
            case "reading_id":
                return {
                    key,
                    label: "Reading ID",
                    value: deviceConfiguration.configuration.reading_id,
                    icon: HiMiniSignal
                };
            case "road_type": {

                const processedLabel = () => {

                    if (deviceConfiguration.configuration?.road_type === 'dddl') { return "Double Direction, Double Lane (DDDL)" }
                    if (deviceConfiguration.configuration?.road_type === 'ddsl') { return "Dobule Direction, Single Lane (DDSL)" }
                    if (deviceConfiguration.configuration?.road_type === 'sdsl') { return "Single Direction, Single Lane (DDSL)" }
                    if (deviceConfiguration.configuration?.road_type === 'sddl') { return "Single Direction, Double Lane (SDDL)" }
                    throw new Error("Value could not be indexed for Road Type chiclet.")
                }

                return {
                    key,
                    label: "Road Type",
                    value: processedLabel(),
                    icon: FaRoad
                };
            }
            case "road_primary_direction":

                return {
                    key,
                    label: "Primary Direction",
                    value: capitalize(deviceConfiguration.configuration.road_primary_direction),
                    icon: FaCompass
                };
            case "road_secondary_direction":
                return {
                    key,
                    label: "Secondary Direction",
                    value: capitalize(deviceConfiguration.configuration.road_secondary_direction),
                    icon: FaCompass
                };
        }
    };

    const chiclets = useMemo(() => {
        if (!deviceConfiguration) {
            return null
        }

        const metadataKeys: Array<DeviceMetadataChicletKey> =
            informationFlags?.metadata
                ? DEVICE_METADATA_CHICLET_KEYS.filter(
                    (key) => informationFlags.metadata?.[key] === true,
                )
                : DEVICE_METADATA_CHICLET_KEYS;

        const configurationKeys: Array<DeviceConfigurationChicletKey> =
            informationFlags?.configuration
                ? DEVICE_CONFIGURATION_CHICLET_KEYS.filter(
                    (key) => informationFlags.configuration?.[key] === true,
                )
                : DEVICE_CONFIGURATION_CHICLET_KEYS;

        const metadataChiclets = metadataKeys.map((key) =>
            transformMetadataChiclet(key),
        );

        const configurationChiclets =
            deviceConfiguration.configuration === null
                ? null
                : configurationKeys.map((key) => transformConfigurationChiclet(key));

        return {
            metadataChiclets,
            configurationChiclets,
        };
    }, [deviceConfiguration, informationFlags]);

    const headingLabel = deviceConfiguration?.device.label
        ? deviceConfiguration.device.label
        : deviceConfiguration?.device.tts_device_id;


    if (deviceConfigurationPending) {
        return (
            <Container className="flex items-center">
                <LoadingSpinner size="lg" />
            </Container>
        )
    }

    return (
        <Container className="@container">
            <div className="flex flex-col @lg:flex-row gap-5">
                <header className="flex flex-col gap-5 items-center @lg:min-w-60">
                    <div className="flex flex-col gap-2 w-full items-center @lg:items-start">
                        <Skeleton height="lg" isLoading={deviceConfigurationPending}>
                            <p className="text-black text-2xl font-semibold text-center @lg:text-left">
                                {headingLabel}
                            </p>
                        </Skeleton>

                        <Skeleton height="md" isLoading={deviceConfigurationPending}>
                            <div className="bg-neutral-300 text-neutral-500 px-2 py-1 w-fit text-xs rounded-lg mb-4">
                                <p className="font-semibold">
                                    <span>Device ID:</span>{" "}
                                    {deviceConfiguration?.device.device_id}
                                </p>
                            </div>
                        </Skeleton>
                    </div>

                    <Skeleton height="container" isLoading={deviceConfigurationPending} className="mx-auto w-3/4">
                        <>
                            {
                                deviceConfiguration?.device.description && (
                                    <p className="text-center text-neutral-400 @lg:text-left max-w-[300px]">
                                        {deviceConfiguration.device.description}
                                    </p>
                                )
                            }
                        </>
                    </Skeleton>
                </header>
                <Skeleton height="container" isLoading={deviceConfigurationPending}>
                    <div className="flex flex-col gap-10 flex-1">
                        {chiclets === null ? (
                            <Note type="attention">
                                <p>
                                    Device information is unavailable at this time. Please try again later.
                                </p>
                            </Note>
                        ) : (
                            <>
                                <div>
                                    <SectionLabel size="md" textColor="black">
                                        Device Information
                                    </SectionLabel>
                                    <div className="
                                        flex flex-col gap-5 @md:grid @lg:grid-cols-2
                                    ">
                                        {
                                            chiclets.metadataChiclets.map((chiclet) =>

                                                <Chiclet
                                                    key={`device-configuration-summary-${String(chiclet.key)}`}
                                                    icon={HiInformationCircle}
                                                    title={chiclet.label}
                                                >
                                                    {String(chiclet.value)}
                                                </Chiclet>
                                            )
                                        }
                                    </div>
                                </div>
                                <div>
                                    <SectionLabel size="md" textColor="black">
                                        Configuration Information
                                    </SectionLabel>
                                    <div className="
                                        flex flex-col gap-5 @md:grid @md:grid-cols-2
                                    ">
                                        {
                                            chiclets.configurationChiclets ? (
                                                chiclets.configurationChiclets.map((chiclet) =>

                                                    <Chiclet
                                                        key={`device-configuration-summary-${String(chiclet.key)}`}
                                                        title={chiclet.label}
                                                        icon={chiclet.icon}
                                                    >
                                                        {String(chiclet.value)}
                                                    </Chiclet>
                                                )
                                            ) : (
                                                <Note type="attention">
                                                    <p>
                                                        Configuration data could not be uploaded. Awaiting first uplink for configuration data.
                                                    </p>
                                                </Note>
                                            )
                                        }
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Skeleton>
            </div>
        </Container >
    );
}