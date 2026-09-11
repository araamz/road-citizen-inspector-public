import * as React from 'react'
import { twMerge } from 'tailwind-merge'

export type SectionLabelProps = React.ComponentPropsWithoutRef<'h5'> & {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  textColor?: 'black' | 'white'
}

const SectionLabel = React.forwardRef<HTMLHeadingElement, SectionLabelProps>(
  (
    {
      children,
      size = 'md',
      textColor = 'white',
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <h5
        ref={ref}
        data-textcolor={textColor}
        data-size={size}
        className={twMerge(
          `
          tracking-wider
          border-amber-400
          font-medium
          data-[textcolor=white]:text-white
          data-[textcolor=black]:text-black
          uppercase
          border-l-2
          data-[size=lg]:border-l-4
          
          data-[size=xs]:pl-1
          data-[size=sm]:pl-2
          data-[size=md]:pl-3
          data-[size=lg]:pl-4
          
          data-[size=xs]:text-[0.65rem]
          data-[size=sm]:text-xs
          data-[size=md]:text-sm
          data-[size=lg]:text-base
          
          data-[size=xs]:mb-2
          data-[size=sm]:mb-3
          data-[size=md]:mb-5
          data-[size=lg]:mb-4
        `,
          className,
        )}
        {...rest} // <-- forwards id, role, aria- attributes, etc.
      >
        {children}
      </h5>
    )
  },
)

SectionLabel.displayName = 'SectionLabel'
export default SectionLabel
