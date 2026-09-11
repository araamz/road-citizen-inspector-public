import type { ReactElement } from 'react'
import * as motion from 'motion/react-client'

export type JumpUpWrapperProps = {
  children: ReactElement
}
export default function JumpUpWrapper({ children }: JumpUpWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
