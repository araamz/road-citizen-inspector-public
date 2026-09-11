import {
  type AlertDialogProps as RadixAlertDialogProps,
  type AlertDialogContentProps as RadixAlertDialogContentProps,
} from '@radix-ui/react-alert-dialog'
import * as RadixAlertDialog from '@radix-ui/react-alert-dialog'
import type { ReactElement } from 'react'
import type { MouseEvent } from 'react'
import * as motion from 'motion/react-client'

import {
  HiCheckCircle,
  HiOutlineXMark,
  HiExclamationTriangle,
} from 'react-icons/hi2'
import Button from './Button'
import type { IconType } from 'react-icons'

export type AlertDialogAction = {
  label: string
  icon?: IconType
  action: (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void
}
export type AlertDialogProps = {
  title: string
  description: string | ReactElement<HTMLParagraphElement>
  type: 'success' | 'error' | 'warning'
  children?: ReactElement
  handleDialogClosure?: (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => void
  dialogOptions?: RadixAlertDialogProps
  contentOptions?: RadixAlertDialogContentProps
  primaryAction: AlertDialogAction
  secondaryAction?: AlertDialogAction
  content?: ReactElement
}
export default function AlertDialog({
  title,
  description,
  type = 'warning',
  children,
  handleDialogClosure,
  dialogOptions,
  contentOptions,
  primaryAction,
  secondaryAction,
  content,
}: AlertDialogProps) {
  return (
    <RadixAlertDialog.Root {...dialogOptions}>
      {children ? (
        <RadixAlertDialog.Trigger asChild>{children}</RadixAlertDialog.Trigger>
      ) : undefined}
      <RadixAlertDialog.Portal>
        <RadixAlertDialog.Overlay className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-md z-[5000]" />
        <RadixAlertDialog.Content
          {...contentOptions}
          className="@container/alert-dialog fixed top-0 left-0 w-full h-full z-[6000] p-10 flex justify-center items-center"
        >
          <motion.article
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div
              data-type={type}
              className="group bg-neutral-100 px-12 py-10 flex flex-col w-fit md:max-w-[500px] lg:w-fit lg:max-w-[800px] gap-5 rounded-lg border-1 border-neutral-300 shadow-lg max-h-full overflow-auto"
            >
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5 @lg/alert-dialog:flex-row @lg/alert-dialog:items-center group-data-[type=error]:text-rose-600 group-data-[type=success]:text-emerald-600 group-data-[type=warning]:text-amber-500">
                  <span className="text-4xl @lg/alert-dialog:text-2xl">
                    {type === 'error' ? <HiOutlineXMark /> : undefined}
                    {type === 'success' ? <HiCheckCircle /> : undefined}
                    {type === 'warning' ? <HiExclamationTriangle /> : undefined}
                  </span>
                  <RadixAlertDialog.Title className="text-2xl/snug font-medium">
                    {title}
                  </RadixAlertDialog.Title>
                </div>
                {typeof description === 'string' ? (
                  <RadixAlertDialog.Description>
                    {description}
                  </RadixAlertDialog.Description>
                ) : (
                  <RadixAlertDialog.Description asChild className="text-base">
                    {description}
                  </RadixAlertDialog.Description>
                )}
                {content ? <>{content}</> : undefined}
              </div>
              <div className="flex flex-row justify-center md:justify-between flex-wrap gap-5 pt-5 border-t-1 border-t-neutral-300">
                <RadixAlertDialog.Cancel
                  asChild
                  onClick={(event) =>
                    handleDialogClosure ? handleDialogClosure(event) : undefined
                  }
                >
                  <Button
                    size="md"
                    variant="secondary"
                    className="order-last md:order-first"
                  >
                    Close
                  </Button>
                </RadixAlertDialog.Cancel>
                <div className="flex flex-row flex-wrap justify-center md:justify-start order-first gap-5 md:order-last">
                  <RadixAlertDialog.AlertDialogAction asChild>
                    <Button
                      size="md"
                      startIcon={primaryAction.icon}
                      onClick={(event) => primaryAction.action(event)}
                      className="order-first md:order-last"
                    >
                      {primaryAction.label}
                    </Button>
                  </RadixAlertDialog.AlertDialogAction>
                  {secondaryAction ? (
                    <RadixAlertDialog.AlertDialogAction asChild>
                      <Button
                        size="md"
                        variant="secondary"
                        startIcon={secondaryAction.icon}
                        onClick={(event) => secondaryAction.action(event)}
                      >
                        {secondaryAction.label}
                      </Button>
                    </RadixAlertDialog.AlertDialogAction>
                  ) : undefined}
                </div>
              </div>
            </div>
          </motion.article>
        </RadixAlertDialog.Content>
      </RadixAlertDialog.Portal>
    </RadixAlertDialog.Root>
  )
}
