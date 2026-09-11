import type { IconType } from 'react-icons'
import { PopoverClose } from '@radix-ui/react-popover'

export type WidgetItemProps = {
  children: string
  icon?: IconType
  descriptor?: string
}
export default function WidgetItem({
  children,
  icon: Icon,
  descriptor,
}: WidgetItemProps) {
  return (
    <PopoverClose asChild>
      <div
        className="
        group
        py-3
        px-5
        [&_div]:text-wrap
        [&_div]:truncate
        active:scale-[0.97]
        border-neutral-400
        border-1
        text-neutral-400
        rounded-lg
        line-clamp-2
        font-medium
        \
        group-data-[status=active]:bg-amber-400
        group-data-[status=active]:text-black
        group-data-[status=active]:border-amber-400
        group-hover:text-amber-400
        group-hover:border-amber-400

        group-active:border-amber-400
        group-active:bg-amber-400
        group-active:text-black
        transition-all

        flex items-center gap-4
        min-h-0
        "
      >
        {Icon ? (
          <span>
            <Icon />
          </span>
        ) : undefined}
        <div className="flex flex-col gap-0.5">
          <p>{children}</p>
          {descriptor ? <p className="text-xs">{descriptor}</p> : undefined}
        </div>
      </div>
    </PopoverClose>
  )
}
