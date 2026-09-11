import { Outlet } from "@tanstack/react-router"
import CompositeBandPreview from "../CompositeBandPreview/CompositeBandPreview"
import SectionLabel from "../SectionLabel"
import SessionSummary from "../SessionSummary"
import VisualziationBandGroup from "../VisualizationBandPreview/VisualizationBandGroup"
import CompositeNetworkDirectionVisualization from "../Visualizations/CompositeNetworkDirectionVisualization"
import CompositeNetworkSpeedGraphVisualization from "../Visualizations/NetworkSpeedGraphVisualization/CompositeNetworkSpeedGraphVisualization"
import NetworkVehicleCompositionVisualization from "../Visualizations/NetworkVehicleCompositionVisualization/NetworkVehicleCompositionVisualization"
import type { CompositeVisualizationData } from "@road-citizen-inspector/visualization"

export type CompositeProjectDashboardProps = {
    compositeData: CompositeVisualizationData,
    showDay: boolean,
    maxVehicleCount: number
}
export default function CompositeProjectDashboard({
    compositeData,
    showDay,
    maxVehicleCount
}: CompositeProjectDashboardProps) {
    return (
        <div className="
            w-full h-full
            flex flex-col gap-5
            @6xl:grid
            @6xl:max-h-full
            @6xl:grid-cols-[minmax(400px,2fr)_5fr_minmax(300px,1fr)]
            @6xl:grid-rows-[min-content_min-contnet_auto]
          ">
            {/* Primary Vizualizations */}
            <section className="
              max-w-full
              overflow-auto
              @6xl:col-start-2 @6xl:col-end-3
              @6xl:row-start-1 @6xl:row-end-2
              
              bg-white flex
              border border-neutral-300 rounded-lg  overscroll-x-none
            ">
                <Outlet />
            </section>
            {/* Summary */}
            <section className="
                @6xl:col-start-2 @6xl:col-end-3
                @6xl:row-start-2 @6xl:row-end-3
                flex flex-col max-h-full overflow-y-auto
            ">
                <div className='w-ful h-full max-h-full @container'>
                    <div className='flex flex-col @lg:grid @lg:grid-cols-2 gap-5'>
                        <CompositeNetworkDirectionVisualization data={compositeData} />
                        <NetworkVehicleCompositionVisualization data={compositeData} />
                        <div className='@lg:col-span-2 bg-white'>
                            <CompositeNetworkSpeedGraphVisualization data={compositeData} />
                        </div>
                    </div>
                </div>
            </section>
            {/* Interval Bands */}
            <section className="
                @6xl:col-start-1 @6xl:col-end-2
                @6xl:row-start-1 @6xl:row-end-4
                overflow-auto
            ">
                <SectionLabel size='lg' textColor='black'>
                    Interval Bands
                </SectionLabel>
                <div className='w-full pr-1 box-border'>
                    <VisualziationBandGroup
                        multiple={false}
                    >
                        {
                            compositeData.bins.map((d) => <CompositeBandPreview showDay={showDay} maxVehicleCount={maxVehicleCount} key={d.index} data={d} />)
                        }
                    </VisualziationBandGroup>
                </div>
            </section>
            { /* Session Information */}
            <section className="
                @6xl:col-start-3 @6xl:col-end-4
                @6xl:row-start-1 @6xl:row-end-3
                min-h-0
            ">
                <SectionLabel textColor='black' size='lg'>
                    Session Information
                </SectionLabel>
                <div className='w-full pr-1 box-border'>
                    <SessionSummary showSessionStatus={false} />
                </div>
            </section>
        </div>
    )
}