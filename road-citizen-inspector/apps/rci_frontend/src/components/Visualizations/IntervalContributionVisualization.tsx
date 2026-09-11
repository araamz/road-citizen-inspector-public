import type { VisualizationMeterProps } from './VisualizationMeter';
import VisualizationMeter from './VisualizationMeter';
import Popover from '../Popover';

export type IntervalContributionVisualizationProps = {
} & VisualizationMeterProps;
export default function IntervalContributionVisualization(props: IntervalContributionVisualizationProps) {

    const { value } = props;

    return (
        <Popover
            positionerProps={{
                side: "bottom",
                sideOffset: 4
            }}
            triggerProps={{
                openOnHover: true,
                closeDelay: 50,
            }}
            title='Data Contribution'
            description='Displays how each time interval contributes to the total recorded observations in this session.'
        >
            <div className='p-2 h-full hover:bg-neutral-50 active:bg-neutral-100 transition-colors rounded-md'>
                <div className='h-2 flex gap-2.5 items-center'>
                    <p className='hidden @xs:inline text-xs font-medium whitespace-nowrap shrink-0 text-neutral-500'>
                        {value} <span className='hidden @sm:inline'>vehicles</span>
                    </p>
                    <div className='w-10! h-full'>
                        <VisualizationMeter showLabel={false}
                            {...props}
                        />
                    </div>
                </div>
            </div>
        </Popover>
    )
}

