import { HiSignal } from 'react-icons/hi2'
import { useQuery } from '@tanstack/react-query'
import Chiclet from './Chiclet/Chiclet'
import LoadingSpinner from './LoadingSpinner'
import SectionLabel from './SectionLabel'
import useDeviceOptions from '@/hooks/queries/device/UseDeviceOptions'

export type DeviceSummaryProps = {
  deviceId: number
}
export default function DeviceSummary({ deviceId }: DeviceSummaryProps) {
  const { isPending, data } = useQuery(useDeviceOptions(deviceId))

  return (
    <article className="w-full h-full">
      <header>
        <SectionLabel textColor="black">Device Summary</SectionLabel>
      </header>

      <section className="flex flex-col gap-5 min-h-[150px] items-center justify-center">
        {isPending ? (
          <LoadingSpinner size="lg" />
        ) : (
          <>
            <Chiclet title="Device ID" icon={HiSignal}>
              {String(data?.device_id ?? 'N/A')}
            </Chiclet>

            <Chiclet title="Device ID (TTS)" icon={HiSignal}>
              {String(data?.tts_device_id)}
            </Chiclet>

            <Chiclet title="Project ID" icon={HiSignal}>
              {String(data?.project_id ?? 'N/A')}
            </Chiclet>

            <Chiclet title="Origin Uplink ID" icon={HiSignal}>
              {String(data?.origin_uplink_id ?? 'N/A')}
            </Chiclet>

            <Chiclet title="Created" icon={HiSignal}>
              {new Date(data?.created_at ?? 'N/A').toLocaleString()}
            </Chiclet>

            <Chiclet title="Last Updated" icon={HiSignal}>
              {new Date(data?.updated_at ?? 'N/A').toLocaleString()}
            </Chiclet>
          </>
        )}
      </section>
    </article>
  )
}
