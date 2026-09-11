import { HiExclamationTriangle, HiEye, HiLightBulb } from 'react-icons/hi2'
import type { ReactElement } from 'react'

export type NoteProps = {
  type?: 'general' | 'urgent' | 'attention'
  children: ReactElement
}

export default function Note({ type = 'general', children }: NoteProps) {
  return (
    <div className="@container/note w-full">
      <article
        data-type={type}
        className="
          flex flex-col gap-2
          border-1 p-4 rounded-lg

          data-[type=general]:bg-amber-400/15 data-[type=general]:border-amber-400
          data-[type=urgent]:bg-red-100 data-[type=urgent]:border-red-400
          data-[type=attention]:bg-blue-100 data-[type=attention]:border-blue-400
        "
      >
        <header
          className="
            flex flex-row gap-2 items-center

            data-[type=general]:text-amber-600
            data-[type=urgent]:text-red-600
            data-[type=attention]:text-blue-600
          "
          data-type={type}
        >
          <span>
            {type === 'general' && <HiLightBulb size={16} />}
            {type === 'urgent' && <HiExclamationTriangle size={16} />}
            {type === 'attention' && <HiEye size={16} />}
          </span>
          <h3 className="font-medium text-sm tracking-wider uppercase">
            {type === 'general' && 'Tip!'}
            {type === 'urgent' && 'Urgent!'}
            {type === 'attention' && 'Note!'}
          </h3>
        </header>

        <div className='p-3'>{children}</div>
      </article>
    </div>
  )
}
