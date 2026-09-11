import * as RadixDialog from '@radix-ui/react-dialog'
import CloseButton from './CloseButton'
import SectionLabel from './SectionLabel'
import FloatUpWrapper from './Motion/FloatUpWrapper'
import type { MouseEvent, ReactElement } from 'react'

export type DialogProps = {
  title: string
  description?: string | ReactElement<HTMLParagraphElement>
  children: ReactElement
  trigger?: ReactElement
  handleDialogClosure?: (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => void
  dialogOptions?: RadixDialog.DialogProps
  contentOptions?: RadixDialog.DialogContentProps
}
export default function Dialog({
  title,
  description,
  children,
  trigger,
  handleDialogClosure,
  dialogOptions,
  contentOptions,
}: DialogProps) {
  return (
    <RadixDialog.Root {...dialogOptions}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-md z-[5000]">
          <RadixDialog.Content
            {...contentOptions}
            className="@container/dialog fixed top-0 left-0 w-full h-full z-6000 p-10 flex justify-center items-center"
          >
            <FloatUpWrapper>
              <article className="group h-min bg-neutral-100 p-10 flex flex-col w-full @md:min-w-[500px] @sm/dialog:w-fit @sm/dialog:max-w-[700px] gap-5 rounded-lg border-1 border-neutral-300 shadow-lg max-h-full overflow-auto overscroll-y-none">
                <header className="flex flex-col gap-5">
                  <div className="flex flex-row justify-between items-center gap-5">
                    <RadixDialog.Title asChild>
                      <SectionLabel className="mb-0!" textColor='black' size='lg'>
                        {title}
                      </SectionLabel>
                    </RadixDialog.Title>
                    <RadixDialog.Close asChild>
                      <CloseButton
                        onClick={(event) =>
                          handleDialogClosure
                            ? handleDialogClosure(event)
                            : undefined
                        }
                      />
                    </RadixDialog.Close>
                  </div>
                  {typeof description === 'string' ? (
                    <RadixDialog.Description>
                      {description}
                    </RadixDialog.Description>
                  ) : (
                    <RadixDialog.Description asChild className="text-base">
                      {description}
                    </RadixDialog.Description>
                  )}
                </header>
                <section>{children}</section>
              </article>
            </FloatUpWrapper>
          </RadixDialog.Content>
        </RadixDialog.Overlay>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
