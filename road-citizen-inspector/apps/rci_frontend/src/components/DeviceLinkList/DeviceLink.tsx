import { BsFillPinAngleFill } from 'react-icons/bs'
import { HiChevronRight } from 'react-icons/hi2'
import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import type { DeviceData } from '@road-citizen-inspector/contracts'

export type DeviceLinkProps = {
  device: DeviceData
} & LinkProps
export default function DeviceLink({ device, ...rest }: DeviceLinkProps) {
  return (
    <Link
      {...rest}
      className="hover:bg-neutral-200 transition-all p-5 border-x-1 first:border-t-1 border-b-1  border-neutral-300 bg-white first:rounded-t-lg last:rounded-b-lg"
    >
      <div className='flex flex-row items-center'>
        <div className="w-[30px]">
          {device.is_pinned ? <BsFillPinAngleFill /> : null}
        </div>
        <div>
          <p className='font-medium'>{device.label ? device.label : device.tts_device_id}</p>
          {device.label ? <p className='text-neutral-500 text-xs'>{device.tts_device_id}</p> : null}
        </div>
        <div className='ml-auto'>
          <span>
            <HiChevronRight />
          </span>
        </div>
      </div>
    </Link>
  )
}
