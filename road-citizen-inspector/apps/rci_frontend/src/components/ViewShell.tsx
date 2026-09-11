import ShellNavigation from './ShellNavigation/ShellNavigation'
import ShellNavigationItem from './ShellNavigation/ShellNavigationItem'
import ShellNavigationContainer from './ShellNavigation/ShellNavigationContainer'
import type { ShellNavigationItemProps } from './ShellNavigation/ShellNavigationItem'
import type { ReactElement } from 'react'

export type ViewShellProps = {
  navigation?: Array<ShellNavigationItemProps>
  children: ReactElement
  type?: 'power' | 'general'
}
export default function ViewShell({
  children,
  navigation = [],
  type = 'general',
}: ViewShellProps) {
  return (
    <article
      data-type={type}
      className="
        relative group @container/view-shell grow w-full h-full
        data-[type=power]:flex 
        data-[type=power]:flex-col 
        data-[type=power]:max-h-full
      "
    >
      {navigation.length > 0 && (
        <ShellNavigation>
          <ShellNavigationContainer>
            {navigation.map((itemProps, index) => (
              <ShellNavigationItem key={index} {...itemProps} />
            ))}
          </ShellNavigationContainer>
        </ShellNavigation>
      )}
      <div
        className="
          w-full
          group-data-[type=general]:p-10 
          @md:mx-auto
          group-data-[type=general]:@md/view-shell:max-w-[700px] 
          group-data-[type=general]:@md/view-shell:self-center 
          group-data-[type=general]:@lg/view-shell:max-w-[1000px] 
          group-data-[type=general]:@xl/view-shell:max-w-[1500px]

          group-data-[type=power]:grow
        "
      >
        {children}
      </div>
    </article>
  )
}
