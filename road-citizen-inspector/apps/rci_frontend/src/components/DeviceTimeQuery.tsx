import { HiClock } from "react-icons/hi2";
import Button from "./Button";
import Drawer from "./Drawer/Drawer";
import DeviceTimeQueryInputs from "./Inputs/VisualizationInputs/DeviceTimeQueryInputs";
import type {DrawerRootProps} from "./Drawer/Drawer";
import type { DeviceTimeQueryInputsProps } from "./Inputs/VisualizationInputs/DeviceTimeQueryInputs";

export type DeviceTimeQueryProps = {
    drawerProps?: DrawerRootProps
} & DeviceTimeQueryInputsProps;
export default function DeviceTimeQuery({drawerProps, ...props}: DeviceTimeQueryProps) {
    return (
        <div className="w-full">
            <div className="hidden @4xl:block">
                <DeviceTimeQueryInputs
                    intervalProps={props.intervalProps}
                    startTimestampProps={props.startTimestampProps}
                    endTimestampProps={props.endTimestampProps}
                    query={props.query}
                    reset={props.reset}
                />
            </div>
            <div className="@4xl:hidden">
                <Drawer
                    title="Explore Device Activity"
                    description="Set a start and end time to define the period you're interested in, and adjust the interval to control how detailed the results appear. Shorter intervals show more granular activity, while longer intervals provide a broader overview. Use reset anytime to quickly return to the default settings."
                    triggerProps={{
                        nativeButton: false,
                        render: <div />
                    }}
                    content={
                        <DeviceTimeQueryInputs
                            intervalProps={props.intervalProps}
                            startTimestampProps={props.startTimestampProps}
                            endTimestampProps={props.endTimestampProps}
                            query={props.query}
                            reset={props.reset}
                        />
                    }
                    {...drawerProps}
                >
                    <Button startIcon={HiClock}>
                        Time Range
                    </Button>
                </Drawer>
            </div>
        </div>
    )
}