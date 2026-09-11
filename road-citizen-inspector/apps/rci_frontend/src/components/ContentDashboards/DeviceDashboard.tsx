import { useMemo, useState } from "react";
import { HiArrowsPointingIn, HiArrowsPointingOut } from "react-icons/hi2";
import { FaCar } from "react-icons/fa6";
import { LuGauge } from "react-icons/lu";
import DeviceConfigurationSummary from "../DeviceConfigurationSummary"
import SectionLabel from "../SectionLabel";
import VisualziationBandGroup from "../VisualizationBandPreview/VisualizationBandGroup";
import DeviceBandPreview from "../DeviceBandPreview/DeviceBandPreview";
import DeviceHistogramVisualization from "../Visualizations/DeviceHistogramVisualization";
import { VEHICLE_KEYS, VEHICLE_KEY_COLORS } from "../Visualizations/CompositeHistogramVisualization/CompositeHistogramVisualization";
import LineDiamondGlyph from "../LineDiamondGlyph";
import ColorGlyph from "../Visualizations/ColorGlyph";
import Button from "../Button";
import type {DeviceHistogramVisualizationProps} from "../Visualizations/DeviceHistogramVisualization";
import type { DeviceVisualizationData } from "@road-citizen-inspector/visualization";
import type { DeviceSearchParamsSchema } from "@/routes/session.$sessionId/_claimed/device/$deviceId";
import type { ColorGlyphProps } from "../Visualizations/ColorGlyph";
import type { LineDiamondGlyphProps } from "../LineDiamondGlyph";
import useDateFormatter from "@/hooks/utilities/useDateFormatter";

type DeviceHistogramLegendItem = {
    label: string,
    glyph: "rect",
    props: ColorGlyphProps,
} | {
    label: string,
    glyph: "lineDiamond"
    props: LineDiamondGlyphProps
}

export type DeviceDashboardProps = {
    deviceId: number;
    data: DeviceVisualizationData,
    searchParams: DeviceSearchParamsSchema
}
export default function DeviceDashboard({
    deviceId,
    data,
    searchParams
}: DeviceDashboardProps) {

    const [visualizationOptions, setVisualizationOptions] = useState<
        Pick<DeviceHistogramVisualizationProps, "visibilityEmphasis" | "widthSizing">>({
            visibilityEmphasis: "counts",
            widthSizing: "fit"
        })

    const { isMultiDay, renderDailyHourly, renderHourly } = useDateFormatter()

    const maxCount = useMemo(() => {
        const binMaxes = data.bins.map((b) => b.processed.vehicleCounts.cumulative)
        const max = Math.max(...binMaxes)

        return Math.max(max, 10)
    }, [data])

    const showDay = isMultiDay(new Date(data.visualizationStart), new Date(data.visualizationEnd))

    const formatDate = (isoDateTime: string) => {
        if (showDay) return renderDailyHourly(new Date(isoDateTime))
        else return renderHourly(new Date(isoDateTime))
    }

    const legendItems = (): Array<Array<DeviceHistogramLegendItem>> => {
        const storageLegend: DeviceHistogramLegendItem = {
            label: "Storage Level",
            glyph: "lineDiamond",
            props: {
                lineColor: "oklch(68.5% 0.169 237.323)",
                glyphColor: "oklch(50% 0.134 242.749)"
            }
        }

        const batteryLegend: DeviceHistogramLegendItem = {
            label: "Battery Level",
            glyph: "lineDiamond",
            props: {
                lineColor: "oklch(72.3% 0.219 149.579)",
                glyphColor: "oklch(52.7% 0.154 150.069)"
            }
        }

        const vehicleTypeLegend: Array<DeviceHistogramLegendItem> = VEHICLE_KEYS.map((vk, idx) => {
            const color = VEHICLE_KEY_COLORS[idx]

            return {
                label: vk.toUpperCase(),
                glyph: "rect",
                props: {
                    color,
                    size: 15
                }
            }
        })

        return [
            [...vehicleTypeLegend],
            [storageLegend, batteryLegend]
        ]
    }

    return (
        <div className="
            w-full h-full max-w-full
            flex flex-col gap-5

            @3xl:grid
            @3xl:grid-cols-[minmax(400px,1fr)_2fr]
            @3xl:grid-rows-[min-content_min-content_auto]

            @6xl:grid-cols-[minmax(500px,1fr)_5fr_minmax(300px,1fr)]
            @6xl:grid-rows-[min-content_min-content_auto]
        ">
            {/* Interval Bins */}
            <div className="
                @3xl:col-start-1
                @3xl:col-end-2
                @3xl:row-start-1
                @3xl:row-end-2

                @6xl:col-start-1
                @6xl:col-end-2
                @6xl:row-start-1
                @6xl:row-end-3
            ">
                <div>
                    <SectionLabel textColor="black" size="lg">
                        Interval Bands
                    </SectionLabel>
                    <VisualziationBandGroup>
                        {
                            data.bins.map((bin, idx) =>
                                <DeviceBandPreview
                                    key={`device-band-preview-${bin.start}-${idx}`}
                                    deviceId={deviceId}
                                    bin={bin}
                                    totalVehicleCount={maxCount}
                                    showDay={showDay}
                                    searchParams={searchParams}
                                />
                            )
                        }
                    </VisualziationBandGroup>
                </div>
            </div>
            {/* Visualization Workspace */}
            <div className="
                @3xl:col-start-2
                @3xl:col-end-3
                @3xl:row-start-1
                @3xl:row-end-2

                @6xl:col-start-2
                @6xl:col-end-3
                @6xl:row-start-1
                @6xl:row-end-2

                overflow-scroll
            ">
                <div className="
                        p-5
                        flex flex-col
                        bg-white border border-neutral-300 rounded-md
                    ">
                    <div className="
                        flex flex-col gap-y-4 pb-5
                    ">
                        {
                            legendItems().map((legendLine) =>
                                <div className="flex flex-row justify-start items-center gap-2.5 flex-wrap @md:justify-center">
                                    {
                                        legendLine.map((item) =>
                                            <div className="flex flex-row gap-1.5 items-center">
                                                <span>
                                                    {item.glyph === "rect" ? (
                                                        <ColorGlyph
                                                            {...item.props}
                                                        />
                                                    ) : (
                                                        <LineDiamondGlyph
                                                            {...item.props}
                                                        />
                                                    )}
                                                </span>
                                                <p className="text-sm font-medium tracking-wider">
                                                    {item.label}
                                                </p>
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>
                    <div className="h-140 min-w-full overflow-auto">
                        <DeviceHistogramVisualization
                            visibilityEmphasis={visualizationOptions.visibilityEmphasis}
                            widthSizing={visualizationOptions.widthSizing}
                            data={data}
                            timeAxis={{
                                height: 60,
                                tickFormatter: (isoDateTime) => formatDate(isoDateTime)
                            }}
                            margins={{
                                bottom: 5
                            }}
                        />
                    </div>
                    <div className="
                        flex flex-col gap-5
                        @md:flex-row @md:flex-wrap @md:justify-center
                    ">
                        <div className="
                            flex flex-col items-center gap-1
                        ">
                            <p className="text-xs font-medium text-neutral-500">
                                Chart Width
                            </p>
                            <div className='flex gap-2.5 w-full items-center justify-center'>
                                <Button
                                    startIcon={HiArrowsPointingIn}
                                    size='xs' variant='secondary'
                                    disabled={visualizationOptions.widthSizing === 'fit'}
                                    onClick={() => setVisualizationOptions((prev) => ({
                                        ...prev,
                                        widthSizing: 'fit'
                                    }))}
                                >
                                    Fit
                                </Button>
                                <Button
                                    startIcon={HiArrowsPointingOut}
                                    size='xs' variant='secondary'
                                    disabled={visualizationOptions.widthSizing === 'content'}
                                    onClick={() => setVisualizationOptions((prev) => ({
                                        ...prev,
                                        widthSizing: 'content'
                                    }))}
                                >
                                    Expand
                                </Button>
                            </div>
                        </div>
                        <div className="
                            flex flex-col items-center gap-1
                        ">
                            <p className="text-xs font-medium text-neutral-500">
                                Layers
                            </p>
                            <div className='flex gap-2.5 w-full items-center justify-center'>
                                <Button
                                    startIcon={FaCar}
                                    size='xs' variant='secondary'
                                    disabled={visualizationOptions.visibilityEmphasis === 'status'}
                                    onClick={() => setVisualizationOptions((prev) => ({
                                        ...prev,
                                        visibilityEmphasis: 'status'
                                    }))}
                                >
                                    Device Status
                                </Button>
                                <Button
                                    startIcon={LuGauge}
                                    size='xs' variant='secondary'
                                    disabled={visualizationOptions.visibilityEmphasis === 'counts'}
                                    onClick={() => setVisualizationOptions((prev) => ({
                                        ...prev,
                                        visibilityEmphasis: 'counts'
                                    }))}
                                >
                                    Vehicle Counts
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Miscellaneous Options */}
            <div className="
                @3xl:col-start-1
                @3xl:col-end-3
                @3xl:row-start-2
                @3xl:row-end-3

                @6xl:col-start-3
                @6xl:col-end-4
                @6xl:row-start-1
                @6xl:row-end-3
            ">
                <div>
                    <SectionLabel textColor="black" size="lg">
                        Device Configuration
                    </SectionLabel>
                    <DeviceConfigurationSummary deviceId={deviceId} />
                </div>
            </div>
        </div>
    )
}