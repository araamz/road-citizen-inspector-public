export type TimeBoxProps = {
  type: 'hrs' | 'mins' | 'secs'
  children: number | undefined
}
export default function TimeBox({ type, children: timeNumber }: TimeBoxProps) {


  const renderNumber = () => {

    if (timeNumber === undefined) {
      return {
        leading: '-',
        following: '-'
      }
    }

    const numberString = timeNumber.toString()

    if (timeNumber > 0) {
      if (timeNumber > 0 && timeNumber < 10) {
        return {
          leading: '0',
          following: numberString[0]
        }
      }
      else {
        return {
          leading: numberString[0],
          following: numberString[1]
        }
      }
    } else {
      return {
        leading: '0',
        following: '0'
      }
    }
  }

  return (
    <article className="flex flex-col gap-1 items-center">
      <section className="flex flex-row gap-2 *:text-xl *:p-4 *:bg-white *:size-fit *:rounded-lg *:border-1 *:border-neutral-300 *:shadow">
        <p>{renderNumber().leading}</p>
        <p>{renderNumber().following}</p>
      </section>
      <p className="font-medium">
        {type === 'hrs' && 'hrs.'}
        {type === 'mins' && 'mins.'}
        {type === 'secs' && 'secs.'}
      </p>
    </article>
  )
}
