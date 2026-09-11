import * as RadixPopover from '@radix-ui/react-popover'
import type {
  PopoverContentProps as RadixPopoverContentProps,
  PopoverProps as RadixPopoverProps,
  PopoverPortalProps as RadixPortalProps,
} from '@radix-ui/react-popover'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import CloseButton from './CloseButton'

export type AppPopoverProps = {
  children: ReactNode
  contentElement: ReactNode
  contentOptions?: Omit<RadixPopoverContentProps, 'children'>
  popoverOptions?: RadixPopoverProps
  portalOptions?: RadixPortalProps
  className?: string
  closeButtonCallback?: () => void
}
export default function AppPopover({
  contentOptions,
  popoverOptions,
  contentElement,
  children,
  className,
  closeButtonCallback,
}: AppPopoverProps) {
  const handlePopoverClosure = () => {
    if (closeButtonCallback) closeButtonCallback()
  }

  return (
    <RadixPopover.Root {...popoverOptions}>
      <RadixPopover.Trigger className="group outline-none">
        {children}
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content {...contentOptions} className='z-[30000]'>
          <RadixPopover.Arrow className="fill-neutral-800/80 backdrop-blur" />
          <div
            className={twMerge(
              'bg-neutral-800/80 backdrop-blur px-5 pb-10 rounded-lg shadow-lg outline-none h-fit max-w-[90svw] w-fit max-h-[80svh] overflow-auto',
              className,
            )}
          >
            <div className="flex flex-col">
              <header className="w-full flex py-5">
                <RadixPopover.Close
                  onClick={() => handlePopoverClosure()}
                  asChild
                >
                  <CloseButton />
                </RadixPopover.Close>
              </header>
              <section className='py-3 px-5'>{contentElement}</section>
            </div>
          </div>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}
