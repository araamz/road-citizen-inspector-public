import type { ReactElement } from 'react'
import SectionLabel from '../../SectionLabel'

export type QuickAccessGroupProps = {
  label: string
  children?: ReactElement | ReactElement[]
}
export default function QuickAccessGroup({
  label,
  children,
}: QuickAccessGroupProps) {
  return (
    <section>
      <SectionLabel>{label}</SectionLabel>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}
