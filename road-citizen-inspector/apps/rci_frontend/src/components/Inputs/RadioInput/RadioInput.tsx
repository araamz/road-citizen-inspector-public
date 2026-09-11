import InputError from '../InputError'
import type { ReactElement } from 'react'
import type { RadioItemProps } from './RadioItem'

export type RadioInputProps = {
  label: string
  children: Array<ReactElement<RadioItemProps>>
  error: string | undefined
  description?: string
}
export default function RadioInput({
  label,
  children,
  error,
  description,
}: RadioInputProps) {
  return (
    <div className="flex flex-col gap-1 @container/radio-input">
      <div className="flex flex-col gap-1">
        <div className='flex flex-col'>
        <p className="text-sm font-medium text-neutral-700">{label}</p>
        {description ? (
          <span className="text-xs text-neutral-500">{description}</span>
        ) : null}
        </div>
        <div className="flex flex-col @sm/radio-input:grid @sm/radio-input:grid-cols-2 gap-4">{children}</div>
      </div>
      {error ? <InputError message={error} /> : undefined}
    </div>
  )
}
