import type { ReactElement } from 'react'
import type { LinkGroupItemProps } from './LinkGroupItem'
import RichLabel from '../RichLabelProps'

export type LinkGroupProps = {
  children: Array<ReactElement<LinkGroupItemProps>>
  label?: string
  description?: string;
}

export default function LinkGroup({ children, label, description }: LinkGroupProps) {
  return (
    <div className="flex flex-col gap-1 @3xl:w-fit">
      { label && <RichLabel label={label} description={description} /> }
      <div className="flex flex-row w-full h-10  gap-2 bg-white border p-1 border-neutral-300 rounded-lg">{children}</div>
    </div>
  )
}
