import { Ring } from 'ldrs/react'
import 'ldrs/react/Ring.css'

// TODO: Finish the other sizes for Loading Spinner.
export type LoadingSpinnerProps = {
  size: 'xs' | 'sm' | 'md' | 'lg'
  color?: string;
}
export default function LoadingSpinner({ 
  size,
  color = 'black'
}: LoadingSpinnerProps) {
  const config = {
    stroke: '2',
    bgOpacity: '0',
    speed: '2',
    color: color,
  }

  if (size === 'xs') return <Ring {...config} size="15" />
  else if (size === 'sm') return <Ring {...config} size="18" />
  else if (size === 'md') return <Ring {...config} size="24" />
  else return <Ring {...config} size="32" />
}
