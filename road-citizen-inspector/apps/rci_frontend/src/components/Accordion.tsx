import { Accordion as BaseAccordion } from '@base-ui-components/react/accordion'
import {
  HiChevronDown,
  HiMiniQuestionMarkCircle,
} from 'react-icons/hi2'

export type AccordionProps = {
  label: string
  children: string
}
export default function Accordion({ label, children }: AccordionProps) {
  return (
    <BaseAccordion.Root>
      <BaseAccordion.Item
        className="
        group
        overflow-hidden 
        bg-white 
        rounded-lg 
        border-1 
        border-neutral-300 
      "
      >
        <BaseAccordion.Header>
          <BaseAccordion.Trigger className="hover:text-amber-600 active:text-amber-600 p-5 transition-colors flex flex-row w-full items-center gap-3">
            <span>
              <HiMiniQuestionMarkCircle size={21} />
            </span>
            <p className=" text-base/snug text-left">{label}</p>
            <HiChevronDown className="group-data-[open]:rotate-180 transition-transform justify-self-end-safe ml-auto" />
          </BaseAccordion.Trigger>
        </BaseAccordion.Header>
        <BaseAccordion.Panel
          className="
            transition-[height]
            ease-out
            h-[var(--accordion-panel-height)]
            data-[starting-style]:h-0
            data-[ending-style]:h-0"
        >
          <div className="px-5 pb-5">
            <p className='text-neutral-500 text-base/relaxed'>{children}</p>
          </div>
        </BaseAccordion.Panel>
      </BaseAccordion.Item>
    </BaseAccordion.Root>
  )
}
