import { HiEllipsisHorizontal } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'
import Tooltip from './Tooltip'
import type {ToolTipProps} from './Tooltip';
import type { IconType } from 'react-icons'

export type IconPlaceholderProps = {
  icon?: IconType
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  active?: boolean
  theme?: "gray" | "white"
  tooltipOptions: Omit<ToolTipProps, "children">
}
export default function IconPlaceholder({
  icon: Icon = HiEllipsisHorizontal,
  size = 'md',
  active,
  className,
  tooltipOptions
}: IconPlaceholderProps) {
  return (
    <Tooltip {...tooltipOptions}>
      <div
        data-size={size}
        data-active={active ? true : false}
        className={twMerge(className, '\
        text-neutral-400\
        flex\
        justify-center\
        items-center\
        aspect-square\
        rounded-lg\
        bg-neutral-50\
        \
        transition-all\
        active:bg-neutral-200\
        hover:bg-neutral-200\
        focus:bg-neutral-200\
        hover:text-black\
        data-[active=true]:bg-neutral-200\
        data-[active=true]:text-black\
        \
        data-[size=xs]:size-6\
        data-[size=sm]:size-8\
        data-[size=md]:size-10\
        data-[size=lg]:size-11')}>
        <Icon
          className="
          data-[size=xs]:size-6
          data-[size=sm]:size-8
          data-[size=md]:size-10
          data-[size=lg]:size-12
        "
        />
      </div>
    </Tooltip>
  )
}
