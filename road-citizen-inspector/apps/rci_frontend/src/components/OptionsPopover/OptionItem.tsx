import type { ButtonHTMLAttributes } from 'react'
import type { IconType } from 'react-icons'

export type OptionItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: IconType
  children: string
}

export default function OptionItem({
  icon: Icon,
  children,
  ...rest
}: OptionItemProps) {
  return (
    <button {...rest} className='grid grid-cols-[25px_1fr] items-center transition-colors active:bg-amber-100 hover:bg-amber-100 active:text-amber-400 hover:text-amber-400 py-1.5 px-4 rounded-lg outline-none'>
      {Icon ? <Icon /> : undefined}
      <p className='text-left text-sm/snug'>
        {children}
      </p>
    </button>
  )
}
