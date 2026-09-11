import { HiMiniExclamationTriangle, HiMiniInformationCircle } from "react-icons/hi2"
import { useMemo } from "react";
import LoadingSpinner from "./LoadingSpinner";
import type { ReactElement } from "react";

export type DisabledCoverProps = {
    type?: 'warning' | 'information' | 'loading'
    children: Array<string> | string;
}

export default function DisabledCover({ type, children }: DisabledCoverProps) {

    const visualization = useMemo((): ReactElement | null => {
        if (type === 'warning') return (
            <HiMiniExclamationTriangle size={18} className="text-neutral-400" />
        )

        if (type === 'information') return (
            <HiMiniInformationCircle size={18} className="text-neutral-400" />
        )

        if (type === 'loading') return (
            <LoadingSpinner color="oklch(70.8% 0 0)" size="sm" />
        )

        return null
    }, [type])

    return (
        <div className="bg-neutral-100 border border-dashed border-neutral-300 w-full h-full flex flex-col items-center justify-center gap-1 px-10 text-center leading-snug rounded-lg text-neutral-500">
            {visualization !== null ? visualization : undefined}
            <p className="text-sm">{children}</p>
        </div>
    )
}