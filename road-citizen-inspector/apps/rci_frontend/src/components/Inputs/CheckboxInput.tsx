import { HiOutlineCheck } from 'react-icons/hi2'
import { forwardRef } from 'react'
import InputError from './InputError'
import type { ForwardedRef, InputHTMLAttributes } from 'react'

export type CheckboxInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  description?: string
}

// NOTE: forwardRef is optional but ideal for react-hook-form's register()
const CheckboxInput = forwardRef(function CheckboxInput(
  { label, error, description, ...rest }: CheckboxInputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  return (
    <label className="flex flex-col gap-1 @container/checkbox-input">
      <div className="flex flex-col gap-1 @md/checkbox-input:flex-row @md/checkbox-input:items-center @md/checkbox-input:gap-5 @md/checkbox-input:justify-between">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-neutral-700">{label}</p>
          {description ? (
            <span className="text-xs text-neutral-500">{description}</span>
          ) : null}
        </div>
        <input
          {...rest}
          ref={ref}
          type="checkbox"
          className="peer hidden"
        />
        <div className="group size-6 transition-colors text-sm flex items-center justify-center rounded-md border-2 border-amber-400 peer-checked:bg-amber-400">
          <HiOutlineCheck className="invisible group-peer-checked:visible" />
        </div>
      </div>
      {error ? <InputError message={error} /> : null}
    </label>
  )
})

export default CheckboxInput
