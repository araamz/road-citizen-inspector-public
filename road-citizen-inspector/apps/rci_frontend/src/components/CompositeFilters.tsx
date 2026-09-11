import { HiFunnel } from "react-icons/hi2";
import Drawer from "./Drawer/Drawer";
import CompositeFiltersInputs from "./Inputs/VisualizationInputs/CompositeFiltersInputs";
import Button from "./Button";
import type { CompositeFiltersInputsProps } from "./Inputs/VisualizationInputs/CompositeFiltersInputs";

export type CompositeFiltersProps = {
} & CompositeFiltersInputsProps;
export default function CompositeFilters({
    ...rest
}: CompositeFiltersProps) {
    return (
        <div className=" w-full flex justify-end @container">
            <div className="hidden @4xl:flex w-full @4xl:max-w-[1000px]">
                <CompositeFiltersInputs {...rest} />
            </div>
            <div className="@4xl:hidden">
                <Drawer
                    swipeDirection='right'
                    title="Composite Visualization Filters"
                    content={<CompositeFiltersInputs {...rest} />}
                    description="Modify the visualization with the following parameters below for finer data aggreagation and granularity."
                    triggerProps={{
                        render: <div />,
                        nativeButton: false
                    }}
                >
                    <Button startIcon={HiFunnel} >
                        Filters
                    </Button>
                </Drawer >
            </div>
        </div>
    )
}
{/* <Tooltip label="Filters" contentOptions={{
    side: "bottom",
    align: "end"
}}>
    <div className="
        @3xl:hidden
        size-10
        bg-white
        border border-neutral-300 rounded-lg
        flex items-center justify-center
    ">

        <HiFunnel size={18} />
    </div>
</Tooltip> */}