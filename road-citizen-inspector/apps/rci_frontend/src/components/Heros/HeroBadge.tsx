export type HeroBadgeProps = {
  title: string
  description?: string
  children?: string;
}
export default function HeroBadge({ title, description, children }: HeroBadgeProps) {
  return (
    <div>
      <div className=" px-10 py-20 w-full @sm:min-w-[300px] @xl:max-w-[300px] justify-center rounded-lg shadow-md bg-radial-[at_25%_25%] from-amber-400 to-amber-700 to-75%">
        <p className="text-4xl/snug tracking-wide font-semibold">{title}</p>
        <p className="mt-10 font-medium">{children ? children : description}</p>
      </div>
    </div>
  )
}
