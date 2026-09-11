import { createFileRoute } from '@tanstack/react-router'
import { HiCursorArrowRipple } from 'react-icons/hi2'

export const Route = createFileRoute('/session/$sessionId/_claimed/project/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="grow min-h-full w-full flex items-center justify-center">
      <div className='max-w-[300px] min-h-[400px] flex flex-col gap-5 items-center justify-center'>
        <span>
          <HiCursorArrowRipple className="text-6xl text-neutral-300" />
        </span>
        <p className='text-center font-medium text-neutral-500'>Please select a visualization from the options above.</p>
      </div>
    </div>
  )
}
