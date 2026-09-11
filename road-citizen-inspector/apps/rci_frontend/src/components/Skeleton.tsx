import { twMerge } from 'tailwind-merge'
import type { ReactElement } from 'react'

export type SkeletonProps = {
  height: 'xs' | 'sm' | 'md' | 'lg' | 'container'
  className?: string
  children: ReactElement | undefined
  isLoading: boolean
}
export default function Skeleton({
  height,
  className,
  children,
  isLoading,
}: SkeletonProps) {
  if (!isLoading) return children

  return (
    <div
      data-height={height}
      className={twMerge(
        '\
    data-[height=xs]:h-4\
    data-[height=sm]:h-8\
    data-[height=md]:h-12\
    data-[height=lg]:h-16\
    data-[height=container]:min-h-full\
    data-[height=container]:h-full\
    bg-neutral-100 rounded-lg\
    animate-pulse',
        className,
      )}
    />
  )
}
