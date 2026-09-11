import type { IconType } from 'react-icons'

export type HeroBadgeProps = {
  icon?: IconType
  title: string
  description: string
}
export default function HeroBanner({
  title,
  description,
}: HeroBadgeProps) {
  return (
    <div className='@container/hero-banner'>
      <div className="px-10 py-20 w-full justify-center rounded-lg shadow-md bg-radial-[at_25%_25%] from-amber-400 to-amber-700 to-75%">
        <p className="text-4xl/snug tracking-wide font-semibold">{title}</p>
        <p className="mt-10 font-medium">{description}</p>
      </div>
    </div>
  )
}
