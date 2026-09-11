import type { SessionClaimStatus } from '@road-citizen-inspector/models'
import type { IconType } from 'react-icons'
import { HiClock, HiExclamationTriangle } from 'react-icons/hi2'

type SessionStatusMetadata = {
  icon: IconType
  label: string
}
export type SessionStatusProps = {
  status: SessionClaimStatus
}
export default function SessionStatus({ status }: SessionStatusProps) {
  let metadata: SessionStatusMetadata

  if (status === 'unclaimed') {
    metadata = {
      icon: HiClock,
      label: 'Unclaimed',
    }
  } else {
    metadata = {
      icon: HiExclamationTriangle,
      label: 'Expired',
    }
  }

  const { icon: Icon, label } = metadata

  return (
    <div className="aspect-square rounded-lg bg-neutral-100 border-neutral-200 border-1 text-neutral-400 size-[100px] flex flex-col gap-1 p-4">
      <span className="self-center my-auto">
        <Icon size={28} />
      </span>
      <p className="text-sm text-center font-medium">{label}</p>
    </div>
  )
}
