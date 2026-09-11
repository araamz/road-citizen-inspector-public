import type { ReactElement } from 'react'
import type { ShellNavigationContainerProps } from './ShellNavigationContainer'

export type ShellNavigationProps = {
  children: ReactElement<ShellNavigationContainerProps>
}
export default function ShellNavigation({ children }: ShellNavigationProps) {
  return (
    <div className="
      min-h-12 h-12 flex items-end
      min-w-full max-w-full
      z-60 left-0 top-0 sticky
      bg-white border-b border-neutral-300 
      px-10
    ">
      {children}
    </div>
  )
}
