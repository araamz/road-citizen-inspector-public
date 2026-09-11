import {  forwardRef } from 'react'
import { HiCheck } from 'react-icons/hi2'
import type {InputHTMLAttributes} from 'react';

export type CheckboxGroupItemProps = {
  children: string
  description?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

const CheckboxGroupItem = forwardRef<HTMLInputElement, CheckboxGroupItemProps>(
  ({ children, description, ...rest }, ref) => {
    return (
      <label className="
        active:scale-[0.97]
        transition-all
        group

        border
        rounded-lg
        border-neutral-300
        bg-white
        p-2.5

        has-checked:bg-amber-100
        has-checked:ring-amber-400
        has-checked:ring-2
        has-checked:border-transparent
        has-checked:shadow-md

        flex flex-row
        justify-between
        items-center

        has-disabled:bg-neutral-100
        has-disabled:cursor-not-allowed
        has-disabled:text-neutral-500
        ">
        <span className='flex flex-col'>
          <span className='font-medium text-sm wrap-anywhere'>{children}</span>
          {description && (
            <span className="mt-0.5 text-sm text-neutral-500">{description}</span>
          )}
        </span>
        <span className="flex items-center justify-center size-6">
          <input ref={ref} type="checkbox" className="peer hidden" {...rest} />
          <HiCheck className="hidden peer-checked:block text-amber-600" />
        </span>
      </label>
    )
  },
)
export default CheckboxGroupItem
