import type { ReactElement } from 'react'
import InputError from './InputError'

export type InputContainerProps = {
  label: string
  children: ReactElement
  error: undefined | string
  description?: string
}
export default function InputContainer({
  label,
  children,
  error,
  description,
}: InputContainerProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex flex-col gap-1">
        <span className="flex flex-col px-1">
          <span className="text-sm font-medium text-neutral-700">{label}</span>
          {description ? (
            <span className="text-xs text-neutral-500">{description}</span>
          ) : null}
        </span>
        {children}
      </label>
      {error ? <InputError message={error} /> : undefined}
    </div>
  )
}
