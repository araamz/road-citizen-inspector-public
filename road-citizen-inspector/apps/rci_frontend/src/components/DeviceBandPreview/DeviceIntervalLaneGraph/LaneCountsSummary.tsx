import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { HiChevronDown } from 'react-icons/hi2';
import type { ReadingBreakdown } from '@road-citizen-inspector/visualization';
import type {DirectionKey, LaneStrKey} from '@/constants';
import { VEHICLE_TYPES  } from '@/constants';
import VisualizationRow from '@/components/VisualizationRow';

export type LaneCountsSummaryProps = {
    title?: string
    lane: LaneStrKey
    data: ReadingBreakdown;
    type: "primary" | "secondary"
    direction: DirectionKey
}
export default function LaneCountsSummary({
    title,
    data,
    lane,
    direction,
}: LaneCountsSummaryProps) {

    const vehicleCounts = Object.entries(data).filter(([vt]) => {
        return VEHICLE_TYPES.find((vehicleKey) => vehicleKey === vt) !== undefined
    }).map(([vt, count]) => {
        return {
            label: vt.charAt(0).toUpperCase() + vt.slice(1),
            count: `${count.toLocaleString()} Vehicles`
        }
    })

    console.log("vehicleCounts", vehicleCounts)

    return (
        <BaseCollapsible.Root className="rounded-md">
            <BaseCollapsible.Trigger className="w-full py-1.5 px-5 rounded-md bg-neutral-100">
                <div className='flex items-center gap-1.5'>
                    <span>
                        <HiChevronDown size={14} />
                    </span>
                    <div className='grow flex flex-row justify-between items-center gap-2.5'>
                        <p className='font-medium text-sm'>
                            Lane {lane} ({direction.charAt(0).toUpperCase() + direction.slice(1)})
                        </p>
                        <p className='text-xs font-medium tracking-wider text-neutral-500'>
                            {data.cumulative} Vehicles
                        </p>
                    </div>
                </div>
            </BaseCollapsible.Trigger>
            <BaseCollapsible.Panel>
                <div className='flex flex-col pt-1'>
                    {
                        vehicleCounts.map((vc) =>
                            <VisualizationRow
                                key={`${title}-visualization-row`}
                                title={vc.label}
                                value={vc.count}

                            />
                        )
                    }
                </div>
            </BaseCollapsible.Panel>
        </BaseCollapsible.Root>
    )
}