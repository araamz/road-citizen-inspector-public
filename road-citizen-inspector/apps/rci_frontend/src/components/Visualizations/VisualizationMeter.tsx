import { Meter as BaseMeter, type MeterRootProps as BaseMeterRootProps } from '@base-ui/react/meter';

export type VisualizationMeterProps = {
    labelColorClassname?: string;
    backgroundColorClassname?: string;
    showLabel?: boolean;
} & BaseMeterRootProps;
export default function VisualizationMeter({
    backgroundColorClassname,
    labelColorClassname,
    showLabel = true,
    ...rest
}: VisualizationMeterProps) {
    return (
        <BaseMeter.Root {...rest} className="w-full h-full flex items-center gap-2.5">
                <BaseMeter.Track className='w-full h-full bg-neutral-200'>
                    <BaseMeter.Indicator
                        className={[backgroundColorClassname ? backgroundColorClassname : 'bg-neutral-500', 'text-white font-medium text-xs'].join(' ')}
                    />
                </BaseMeter.Track>
                {
                    showLabel && (
                        <BaseMeter.Value
                            className={[labelColorClassname ? labelColorClassname : 'text-neutral-500', 'font-medium text-xs'].join(' ')}
                        />
                    )
                }
        </BaseMeter.Root>
    )
}