import ToggleGroup from '../ToggleGroup';
import Toggle from '../Toggle';

export type VisualizationSize = {
    value: string;
    icon: string;
    height: string;
}
export const VISUALIZATION_SIZES: Array<VisualizationSize> = [
    {
        value: 'sm',
        icon: 'sm',
        height: "300px"
    },
    {
        value: 'md',
        icon: 'md',
        height: "400px"
    },
    {
        value: 'lg',
        icon: 'lg',
        height: "500px"
    }
] as const
const DEFAULT_VISUALIZATION = VISUALIZATION_SIZES[1]

export type VisualizationSizeValues = typeof VISUALIZATION_SIZES[number]['value']

export type VisualizationSizeToggleProps = {
    toggleValue: Array<VisualizationSizeValues>,
    setToggle: (size: Array<VisualizationSizeValues>) => void
} 

export default function VisualizationSizeToggle({toggleValue, setToggle}: VisualizationSizeToggleProps) {


    return (
        <ToggleGroup<VisualizationSizeValues> value={toggleValue} onValueChange={setToggle} defaultValue={[DEFAULT_VISUALIZATION.value]}>
            {
                VISUALIZATION_SIZES.map((vs) => (
                    <Toggle key={vs.value} value={vs.value} textIcon={vs.icon} />
                ))
            }
        </ToggleGroup>
    )
}