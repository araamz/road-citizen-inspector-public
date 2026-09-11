import type { IconType } from 'react-icons/lib'
import { Link, type LinkComponentProps } from '@tanstack/react-router'
import WidgetItem from '../../WidgetItem'

export type PrimaryLinkItemProps = {
  children: string
  icon: IconType
} & LinkComponentProps
export default function PrimaryLinkItem({
  children,
  icon: Icon,
  ...rest
}: PrimaryLinkItemProps) {
  return (
    <Link {...rest} className='group'>
      <WidgetItem icon={Icon}>
        { children }
      </WidgetItem>
    </Link>
  )
}