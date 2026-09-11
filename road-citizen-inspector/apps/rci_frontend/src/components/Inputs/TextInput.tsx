import InputContainer from './InputContainer'
import type { InputHTMLAttributes } from 'react'

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error: undefined | string
  type?: 'text' | 'password' | 'date' | 'time' | 'datetime-local' | 'number'
  description?: string
}

export default function TextInput({
  type = 'text',
  label,
  error,
  description,
  ...rest
}: TextInputProps) {
  return (
    <InputContainer label={label} error={error} description={description}>
      <input
        {...rest}
        type={type}
        className="
          transition-all 
          bg-white 
          border-1 border-neutral-300 
          rounded-lg 
          px-3 py-2 
          outline-none 
          placeholder:italic

          focus:ring-2 
          focus:border-transparent 
          focus:ring-amber-400 
          focus:shadow-md

          enabled:focus:border-transparent 
          enabled:focus:ring-2 
          enabled:focus:ring-amber-400 
          enabled:focus:shadow-md

          disabled:bg-neutral-100 
          disabled:text-neutral-500 
          disabled:placeholder:text-neutral-400 
          disabled:border-neutral-200 
          disabled:shadow-none 
          disabled:ring-0 
          disabled:cursor-not-allowed
          
          read-only:bg-neutral-50 
          read-only:text-neutral-700 
          read-only:border-neutral-200 
          read-only:focus:ring-0 
          read-only:cursor-text
        "
      />
    </InputContainer>
  )
}
