import * as RadixPopover from '@radix-ui/react-popover'
import { twMerge } from 'tailwind-merge'
import type {
  PopoverContentProps as RadixPopoverContentProps,
  PopoverProps as RadixPopoverProps,
  PopoverPortalProps as RadixPortalProps,
} from '@radix-ui/react-popover'
import type { ReactElement } from 'react'
import type { OptionGroupProps } from './OptionGroup'

export type OptionsPopoverProps = {
  className?: string
  trigger: ReactElement;
  contentOptions?: Omit<RadixPopoverContentProps, 'children'>
  popoverOptions?: RadixPopoverProps
  portalOptions?: RadixPortalProps
  children:
    | Array<ReactElement<OptionGroupProps>>
    | ReactElement<OptionGroupProps>
}

export default function OptionsPopover({
  contentOptions,
  popoverOptions,
  trigger,
  children,
  className,
}: OptionsPopoverProps) {
  return (
    <RadixPopover.Root {...popoverOptions}>
      <RadixPopover.Trigger className="group outline-none">
        {trigger}
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          {...contentOptions}
          className={twMerge(
            'bg-white/90 backdrop-blur-sm px-5 py-3 rounded-lg shadow-lg border-1 border-neutral-300 outline-none\
            flex flex-col *:border-t-1 *:border-t-neutral-300 *:first:border-none',
            className,
          )}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}
