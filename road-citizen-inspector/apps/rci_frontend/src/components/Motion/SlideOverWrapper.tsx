import type { ReactElement } from 'react'
import * as motion from 'motion/react-client'

export type SlideOverWrapperProps = {
  children: ReactElement
}
export default function SlideOverWrapper({
  children,
}: SlideOverWrapperProps) {
  return (
    <motion.div
      className="flex flex-col gap-10 h-full min-h-full"
      initial={{
        opacity: 0.5,
        translateX: -40,
      }}
      animate={{
        opacity: 1,
        translateX: 0,
      }}
      transition={{
        duration: 0.8,
        type: 'spring',
      }}
      style={{
        willChange: 'transform',
      }}
    >
      <>{children}</>
    </motion.div>
  )
}
