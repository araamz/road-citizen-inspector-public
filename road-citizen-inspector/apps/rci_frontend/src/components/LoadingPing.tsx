import { Ping } from 'ldrs/react'
import 'ldrs/react/Ping.css'

type LoadingPingColor = 'black' | 'orange' | string

type LoadingPingParameters = {
  size: number
  speed: number
  color: string
}

export type LoadingPingProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  color?: LoadingPingColor
}

export default function LoadingPing({
  size = 'md',
  color = 'black',
}: LoadingPingProps) {
  let params: LoadingPingParameters

  // Normalize color
  let resolvedColor = color
  if (color === 'black') resolvedColor = '#000000'
  if (color === 'orange') resolvedColor = '#ffba00'

  // Map sizes with scaling
  switch (size) {
    case 'xs':
      params = { size: 10, speed: 2.5, color: resolvedColor }
      break
    case 'sm':
      params = { size: 20, speed: 2.2, color: resolvedColor }
      break
    case 'md':
      params = { size: 35, speed: 2, color: resolvedColor }
      break
    case 'lg':
      params = { size: 50, speed: 1.8, color: resolvedColor }
      break
    case 'xl':
      params = { size: 70, speed: 1.6, color: resolvedColor }
      break
    case '2xl':
      params = { size: 90, speed: 1.4, color: resolvedColor }
      break
    case '3xl':
      params = { size: 120, speed: 1.2, color: resolvedColor }
      break
    case '4xl':
      params = { size: 150, speed: 1, color: resolvedColor }
      break
    case '5xl':
      params = { size: 200, speed: 0.9, color: resolvedColor }
      break
    default:
      params = { size: 35, speed: 2, color: resolvedColor }
  }

  return <Ping size={params.size} speed={params.speed} color={params.color} />
}
