import { Link } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'
import type { LinkProps } from '@tanstack/react-router'
import type { ReactElement } from 'react'

export type LinkGroupItemProps = {
  label?: string
  previewElement: ReactElement
  className?: string
} & LinkProps
export default function LinkGroupItem({
  label,
  previewElement,
  className,
  ...linkProps
}: LinkGroupItemProps) {
  return (
    <Link
      {...linkProps}
      className={twMerge(
        `
        flex flex-1 justify-center items-center gap-2 px-2 text-sm select-none @xl:basis-auto @lg:px-5 @lg:py-2
        transition-colors rounded-md

        bg-white

        first:rounded-l-lg
        last:rounded-r-lg

        

        /* ACTIVE STATE */
        data-[status=active]:bg-amber-400/15
        // data-[status=active]:border-amber-600
        data-[status=active]:text-amber-600
        // data-[status=active]:border-l-amber-600
        // data-[status=active]:border-r-amber-600

        /* INACTIVE HOVER */
        hover:bg-neutral-50
        active:bg-neutral-100

      `,
        className,
      )}
    >
      <span className='text-center'>{previewElement}</span>
      {label ? <p className="hidden @xs:block">{label}</p> : null}
    </Link>
  )
}
