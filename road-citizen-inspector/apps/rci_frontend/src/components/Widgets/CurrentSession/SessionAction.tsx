import WidgetItem from '../WidgetItem'
import type { HTMLAttributes } from 'react'
import type { IconType } from 'react-icons'

export type SessionActionProps = HTMLAttributes<HTMLButtonElement> & {
  label: string
  icon: IconType
}
export default function SessionAction({
  label,
  icon,
  ...rest
}: SessionActionProps) {
  return (
    <button className='group' {...rest}>
      <WidgetItem icon={icon}>{label}</WidgetItem>
    </button>
  )
}
