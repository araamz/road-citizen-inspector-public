import type { ButtonHTMLAttributes } from 'react'
import { HiMiniXCircle } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'

export type CloseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>
export default function CloseButton({className, ...rest}: CloseButtonProps) {
  return (
    <button {...rest} className={twMerge("transition-colors ml-auto text-neutral-500 hover:text-rose-400 active:text-rose-400", className)}>
      <HiMiniXCircle size={24} />
    </button>
  )
}
