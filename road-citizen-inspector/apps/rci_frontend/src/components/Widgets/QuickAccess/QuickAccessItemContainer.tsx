import { Link, type LinkProps } from '@tanstack/react-router';
import type { ReactElement } from 'react'
import { twMerge } from 'tailwind-merge'

export type QuickAccessItemContainerProps = LinkProps & {
  children: ReactElement
  className?: string;
}
export default function QuickAccessItemContainer({
  children,
  className,
  ...rest
}: QuickAccessItemContainerProps) {
  return (
    <Link
      {...rest}
      className={twMerge(
        'group\
        py-3\
        px-5\
        [&_div]:text-wrap\
        [&_div]:truncate\
        active:scale-[0.97]\
        transition-all\
        border-neutral-400\
        border-1\
        text-neutral-400\
        rounded-lg\
        line-clamp-2\
        font-medium\
        \
        data-[status=active]:bg-amber-400\
        data-[status=active]:text-black\
        data-[status=active]:border-amber-400\
        hover:text-amber-400\
        active:text-amber-400\
        active:border-amber-400\
        hover:border-amber-400\
        transition-all',
        className
      )}
    >
      {children}
    </Link>
  )
}
