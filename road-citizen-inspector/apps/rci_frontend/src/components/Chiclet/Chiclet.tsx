import type { IconType } from 'react-icons'

export type ChicletProps = {
  title: string
  children: string
  icon?: IconType
}
export default function Chiclet({
  title,
  children,
  icon: Icon,
}: ChicletProps) {
  return (
    <article className="bg-neutral-50 border-1 border-neutral-300 rounded-lg p-2 w-full flex flex-col gap-y-0.5">
      <header className='flex flex-row gap-1 items-center text-neutral-500'>
        {Icon && (
          <span>
            <Icon size={12} />
          </span>
        )}
        <p className='text-xs'>{title}</p>
      </header>
      <footer className='text-sm truncate text-wrap'>{children}</footer>
    </article>
  )
}
