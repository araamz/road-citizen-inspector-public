import { HiMiniExclamationCircle } from "react-icons/hi2";

export type InputErrorProps = {
  message: string
}
export default function InputError({ message }: InputErrorProps) {
  return (
    <div className="flex items-center mt-1 gap-2 text-rose-600">
      <span>
        <HiMiniExclamationCircle size={15} />
      </span>
      <p className="text-xs">{message}</p>
    </div>
  )
}
