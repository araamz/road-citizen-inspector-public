import type { InputHTMLAttributes } from 'react'
import type { IconType } from 'react-icons/lib'

export type RadioItemProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon?: IconType
  description?: string
}
export default function RadioItem({
  label,
  icon: Icon,
  description,
  ...rest
}: RadioItemProps) {
  return (
    <div className='@container/radio-item'>
      <label
        className="
            h-full
            transition-all
            group
            border-1 
            border-neutral-300 
            p-2.5
            rounded-lg
            bg-white
            flex flex-col
            gap-1.5
            active:scale-[0.97]

            has-checked:bg-amber-100
            has-checked:ring-amber-400
            has-checked:ring-2
            has-checked:border-transparent
            has-checked:shadow-md

            @md/radio-input:flex-row
            @md/radio-input:items-center
            @md/radio-input:gap-3
        "
      >
        <>
          {Icon ? (
            <span>
              <Icon size={18} />
            </span>
          ) : null}
        </>
        <span className="flex flex-col gap-1">
          <span className="font-medium text-sm capitalize">{label}</span>
          {description ? (
            <span className='text-neutral-500 text-sm'>{description}</span>
          ) : undefined}
        </span>
        <input className="hidden" {...rest} type="radio" />
      </label>
    </div>
  )
}
