import type { ReactElement } from 'react'
import type { ButtonProps } from '../Button'
import { BiTrafficCone } from 'react-icons/bi'

export type ErrorComponentProps = {
  error: Error
  children: ReactElement<ButtonProps> | ReactElement<ButtonProps>[]
}
export default function ErrorComponent({
  error,
  children,
}: ErrorComponentProps) {
  return (
    <div className="flex mt-40 px-10 justify-center min-w-full min-h-full">
      <div className="flex flex-col gap-16">
        <div>
          <BiTrafficCone size={108} className="text-amber-600" />
          <div className="flex flex-col gap-4">
            <p className="text-4xl text-amber-600 font-bold tracking-wider">
              UH OH!
            </p>
            <p className="text-xl font-semibold max-w-[500px]">{error.message}</p>
          </div>
        </div>
        <div className="flex flex-row gap-4">{children}</div>
      </div>
    </div>
  )
}
