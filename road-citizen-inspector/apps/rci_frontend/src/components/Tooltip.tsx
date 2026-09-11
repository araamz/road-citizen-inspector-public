import { type TooltipContentProps } from '@radix-ui/react-tooltip'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'
import type { IconType } from 'react-icons/lib'

export type ToolTipProps = {
  children: ReactNode
  icon?: IconType
  label: string
  contentOptions?: Omit<TooltipContentProps, 'children' | 'className'>
}
export default function Tooltip({
  children,
  icon: Icon,
  label,
  contentOptions,
}: ToolTipProps) {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger className='group' asChild>
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="z-[5000] bg-neutral-800/80 backdrop-blur-md px-4 py-2 rounded-lg shadow"
            {...contentOptions}
          >
            <RadixTooltip.Arrow className="fill-neutral-800/80 backdrop-blur-md" />
            {Icon ? (
              <span>
                <Icon />
              </span>
            ) : null}
            <p className="text-xs font-medium text-white">{label}</p>
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
