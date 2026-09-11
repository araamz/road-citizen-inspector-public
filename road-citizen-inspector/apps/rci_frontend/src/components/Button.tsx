import { twMerge } from 'tailwind-merge'
import type { ButtonHTMLAttributes } from 'react'
import type { IconType } from 'react-icons'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  startIcon?: IconType
  endIcon?: IconType
  children: string | Array<string>
}

export default function Button({
  className,
  size = 'md',
  variant = 'primary',
  startIcon: StartIcon,
  endIcon: EndIcon,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      data-size={size}
      data-variant={variant}
      className={twMerge(
        `
        inline-flex items-center w-fit justify-center text-nowrap font-medium rounded-lg transition-all outline-none
        active:translate-y-[1px]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-offset-1
        data-[variant=primary]:focus-visible:ring-amber-600
        data-[variant=secondary]:focus-visible:ring-neutral-600
        border
        border-transparent

        data-[size=xs]:text-xs
        data-[size=xs]:gap-0.5
        data-[size=xs]:px-2.5
        data-[size=xs]:py-1
        data-[size=xs]:h-6

        data-[size=sm]:text-sm
        data-[size=sm]:gap-1
        data-[size=sm]:px-3
        data-[size=sm]:h-8

        data-[size=md]:text-sm
        data-[size=md]:gap-1.5
        data-[size=md]:px-4
        data-[size=md]:h-10

        data-[size=lg]:text-base
        data-[size=lg]:gap-2
        data-[size=lg]:px-5
        data-[size=lg]:h-12
        
        data-[variant=primary]:bg-amber-400
        data-[variant=primary]:hover:bg-amber-500
        data-[variant=primary]:active:bg-amber-500
        data-[variant=primary]:text-black

        data-[variant=secondary]:bg-neutral-300
        data-[variant=secondary]:hover:bg-neutral-200
        data-[variant=secondary]:active:bg-neutral-300
        data-[variant=secondary]:text-neutral-700
        data-[variant=secondary]:shadow-none

        disabled:border
        disabled:border-neutral-300!
        disabled:bg-neutral-100!
        disabled:text-neutral-400!
        disabled:shadow-none!
        disabled:cursor-not-allowed!
        `,
        className,
      )}
      {...rest}
    >
      {StartIcon && (
        <StartIcon
          className={twMerge(
            size === 'xs' && 'text-xs',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-lg',
            size === 'lg' && 'text-xl',
          )}
        />
      )}

      <span>{children}</span>

      {EndIcon && (
        <EndIcon
          className={twMerge(
            size === 'xs' && 'text-xs',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-lg',
            size === 'lg' && 'text-xl',
          )}
        />
      )}
    </button>
  )
}
