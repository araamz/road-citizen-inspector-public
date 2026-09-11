import type { TextareaHTMLAttributes } from 'react'
import InputContainer from './InputContainer'

export type TextAreaInputProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error: undefined | string
  description?: string
}

export default function TextAreaInput({
  label,
  error,
  description,
  ...rest
}: TextAreaInputProps) {
  return (
    <InputContainer label={label} error={error} description={description}>
      <textarea
        {...rest}
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
