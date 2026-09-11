import { HiOutlineInformationCircle } from "react-icons/hi2";
import Popover from "./Popover";
import type {PopoverPositionerProps, PopoverTriggerProps} from "./Popover";
import type { DeviceConfigurationData } from "@road-citizen-inspector/contracts";

export type RoadConfigurationLabelProps = {
    configuration: DeviceConfigurationData['configuration']
    position?: PopoverPositionerProps
    trigger?: PopoverTriggerProps
}
export default function RoadConfigurationLabel({
    configuration,
    position,
    trigger,
}: RoadConfigurationLabelProps) {

    if (configuration === null) {
        return (
            <p className="text-xs font-medium text-neutral-400">
                Awaiting Reading Uplink...
            </p>
        )
    }

    const stringConfiguration = () => {
        const roadType = configuration.road_type.toUpperCase()
        const pDirection = configuration.road_primary_direction.charAt(0).toUpperCase() + configuration.road_primary_direction.slice(1)
        const sDirection = (configuration.road_type === 'ddsl' || configuration.road_type === 'dddl') ?
            configuration.road_secondary_direction.charAt(0).toUpperCase() + configuration.road_secondary_direction.slice(1) : undefined

        return [
            `${roadType}, ${pDirection}`,
            sDirection ? `, ${sDirection}` : undefined
        ].join('')
    }


    const description = () => {
        const roadTypeDescription = () => {
            const cfg = configuration.road_type.toLowerCase()
            if (cfg === 'dddl') return 'Double Direction, Double Lane'
            if (cfg === 'ddsl') return 'Dobule Direction, Single Lane'
            if (cfg === 'sddl') return 'Single Direction, Double Lane'
            if (cfg === 'sdsl') return 'Single Direction, Single Lane'
            return '--,--'
        }
        const pDirection = configuration.road_primary_direction.charAt(0).toUpperCase() + configuration.road_primary_direction.slice(1)
        const sDirection = (configuration.road_type === 'ddsl' || configuration.road_type === 'dddl') ?
            configuration.road_secondary_direction.charAt(0).toUpperCase() + configuration.road_secondary_direction.slice(1) : undefined


        const roadTypeSentence = `The sensor roadway configuration is ${roadTypeDescription()}.`

        const directionSentence = [
            `The primary direction of monitoring is ${pDirection}.`,
            sDirection ? `The secondary direction of monitoring is ${sDirection}.` : undefined
        ].join(' ')

        return [roadTypeSentence, directionSentence].join(' ')
    }

    return (
        <Popover
            title="Sensor Configuration"
            widthClassname="w-60"
            description={description()}
            positionerProps={{
                align: 'start',
                alignOffset: 0,
                side: 'bottom',
                sideOffset: 5,
                ...position
            }}
            triggerProps={{
                delay: 300,
                openOnHover: true,
                ...trigger
            }}
        >
            <div className="text-neutral-400 flex gap-0.5 items-center hover:underline transition-colors">
                <p className="text-xs font-medium  w-fit">
                    {stringConfiguration()}
                </p>
                <HiOutlineInformationCircle size={14} />
            </div>
        </Popover>
    )
}