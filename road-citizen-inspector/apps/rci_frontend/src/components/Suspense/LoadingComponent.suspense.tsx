import LoadingPing from '../LoadingPing'

export type ContainerLoaderProps = {
  message?: string
}
export default function ContainerLoader({ message }: ContainerLoaderProps) {
  return (
    <div className='w-full h-full flex mt-40 gap-4 justify-center items-center'>
      <div className='flex flex-col'>
        <LoadingPing size="3xl" color='oklch(76.9% 0.188 70.08)' />
        {message ? <p>{message}</p> : undefined}
      </div>
    </div>
  )
}
