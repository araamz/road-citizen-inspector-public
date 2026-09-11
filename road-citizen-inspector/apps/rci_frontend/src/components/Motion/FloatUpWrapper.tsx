import * as motion from 'motion/react-client'
import type { ReactElement } from 'react'

export type FloatUpWrapperProps = {
  children: ReactElement
}
export default function FloatUpWrapper({ children }: FloatUpWrapperProps) {
  return (
    <motion.div 
      className='items-center-safe justify-center-safe flex w-full h-full min-h-full'
      initial={{
        opacity: 0,
        y: 60, // starts below the screen
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: 40,
        scale: 0.95,
      }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.8, 0.5, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
