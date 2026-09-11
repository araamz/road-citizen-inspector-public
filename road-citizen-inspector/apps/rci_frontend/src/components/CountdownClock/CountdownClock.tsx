import { useEffect, useMemo, useState } from 'react'
import TimeBox from './TimeBox'

export type CountdownClockProps = {
  label: string
  endingTime?: Date
}
export default function CountdownClock({
  label,
  endingTime,
}: CountdownClockProps) {
  const [delta, setDelta] = useState<number>(-1)

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setDelta(() => {
        const current = new Date(Date.now())
        if (!endingTime) return 0
        return (
          (1000 * 60 * 60 * 24 + (endingTime.getTime() - current.getTime())) /
          1000
        )
      })
    }, 1000)

    return () => {
      clearInterval(clockInterval)
    }
  }, [endingTime, setDelta])

  const remaining = useMemo(() => {
    if (delta < 0)
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
    const hours = Math.floor(delta / (60 * 60))
    const minutes = Math.floor((delta / 60) % 60)
    const seconds = Math.floor(delta % 60)

    return {
      hours,
      minutes,
      seconds,
    }
  }, [delta])

  return (
    <article className="@container/countdown-clock flex flex-col gap-2 items-center">
      <h3 className="uppercase tracking-wider font-medium text-neutral-500">{label}</h3>
      <section className="flex flex-row gap-6">
        <TimeBox type="hrs">{delta === -1 ? undefined : remaining.hours}</TimeBox>
        <TimeBox type="mins">{delta === -1 ? undefined : remaining.minutes}</TimeBox>
        <div className='hidden @xs:block'>
          <TimeBox type="secs">{delta === -1 ? undefined : remaining.seconds}</TimeBox>
        </div>
      </section>
    </article>
  )
}
