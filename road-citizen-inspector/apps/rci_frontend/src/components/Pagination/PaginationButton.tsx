import type { ButtonHTMLAttributes, ReactElement } from "react";

export type PaginationButtonProps = {
    active?: boolean;
    children?: ReactElement;
    onClick?: () => void;
}  & ButtonHTMLAttributes<HTMLButtonElement>
export default function PaginationButton({ children, onClick, active = false, ...rest }: PaginationButtonProps) {
    return (
        <button
            onClick={onClick}
            data-active={active}
            className="
                bg-white
                border-neutral-300
                text-neutral-500
                font-medium
                rounded-lg 

                data-[active=true]:bg-amber-400/15 
                data-[active=true]:text-amber-600 
                data-[active=true]:border-amber-600 
                px-4 h-8 flex items-center 
                justify-center border 

                not-disabled:hover:bg-amber-400/15! 
                not-disabled:hover:text-amber-600!
                not-disabled:hover:border-amber-600!

                not-disabled:active:bg-amber-400/15! 
                not-disabled:active:text-amber-600!
                not-disabled:active:border-amber-600!
                not-disabled:active:translate-y-px
                not-disabled:active:scale-[0.97]

                transition-all
                
                disabled:bg-neutral-300
                disabled:text-neutral-500"
            {...rest}
        >
            {children}
        </button>
    )
}