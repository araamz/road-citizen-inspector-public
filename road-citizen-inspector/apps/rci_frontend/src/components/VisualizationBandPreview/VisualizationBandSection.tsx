import { HiChevronDown, HiOutlineInformationCircle } from "react-icons/hi2";
import { Collapsible } from '@base-ui/react/collapsible';
import Popover from "../Popover";
import Skeleton from "../Skeleton";
import type { ReactElement } from "react";

export type VisualizationBandSectionProps = {
    label: string;
    description: string;
    children: ReactElement<HTMLDivElement>
    preview: {
        thumbnail: ReactElement;
        status: string;
    },
    loading?: boolean;
    disabled?: boolean
}

export default function VisualizationBandSection({
    label,
    description,
    preview,
    children,
    loading,
    disabled
}: VisualizationBandSectionProps) {

    return (
        <Skeleton
            height="sm"
            isLoading={loading ? loading : false}
        >
            <Collapsible.Root className="border-b border-b-neutral-300 pb-2 last:border-b-0 last:pb-0" disabled={disabled || loading}>
                <div className={`
                pl-2 border-l-2 border-l-amber-400
                flex flex-row gap-2.5
                justify-between items-center
            `}>
                    <div className="flex flex-col grow">
                        <Collapsible.Trigger className="
                        hover:bg-neutral-100 active:bg-neutral-200 transition-colors
                        py-1 px-2 rounded-md
                        group
                    ">
                            <div className="
                        flex flex-row items-center gap-1.5
                    ">
                                <span className={`group-data-panel-open:rotate-180 transition-transform`}>
                                    <HiChevronDown size={14} />
                                </span>
                                <p className="font-medium text-left leading-snug">
                                    {label}
                                </p>
                                <Popover
                                    title={label}
                                    description={description}
                                    positionerProps={{
                                        align: 'center',
                                        alignOffset: 0,
                                        side: 'bottom',
                                        sideOffset: 5
                                    }}
                                    triggerProps={{
                                        delay: 300,
                                        openOnHover: true,
                                        nativeButton: false,
                                        render: (el) => <div {...el} />
                                    }}
                                >
                                    <span>
                                        <HiOutlineInformationCircle />
                                    </span>
                                </Popover>
                            </div>
                            <p className="text-sm font-medium text-neutral-500 text-left">
                                {preview.status}
                            </p>
                        </Collapsible.Trigger>
                    </div>
                    <div>
                        {preview.thumbnail}
                    </div>
                </div>
                <Collapsible.Panel className='pt-2.5'>
                    {children}
                </Collapsible.Panel>
            </Collapsible.Root>
        </Skeleton>
    )
}