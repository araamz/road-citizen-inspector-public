import { Link  } from '@tanstack/react-router'
import WidgetItem from '../WidgetItem'
import type {LinkComponentProps} from '@tanstack/react-router';
import type { IconType } from 'react-icons'

export type SessionLinkProps = LinkComponentProps & {
  label: string
  icon: IconType
}
export default function SessionLink({
  label,
  icon,
  ...rest
}: SessionLinkProps) {
  return (
    <Link className='group' {...rest}>
      <WidgetItem icon={icon}>{label}</WidgetItem>
    </Link>
  )
}
