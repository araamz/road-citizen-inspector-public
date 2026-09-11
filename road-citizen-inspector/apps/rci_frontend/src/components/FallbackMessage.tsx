import type { IconType } from 'react-icons'

export type FallbackMessageProps = {
  size?: 'sm' | 'md' | 'lg'
  icon: IconType
  children: string
}

export default function FallbackMessage({
  icon: Icon,
  size = 'md',
  children,
}: FallbackMessageProps) {
  return (
    <div
      data-size={size}
      className="group flex flex-col items-center justify-center text-neutral-400"
    >
      <div className="flex flex-col items-center gap-1.5 max-w-[500px]">
        <span>
          <Icon
            className="
              group-data-[size=sm]:size-8
              group-data-[size=md]:size-10
              group-data-[size=lg]:size-18
            "
          />
        </span>

        <p
          className="
            text-center
            font-medium
            group-data-[size=sm]:text-sm
            group-data-[size=md]:text-base
            group-data-[size=lg]:text-lg
          "
        >
          {children}
        </p>
      </div>
    </div>
  )
}
