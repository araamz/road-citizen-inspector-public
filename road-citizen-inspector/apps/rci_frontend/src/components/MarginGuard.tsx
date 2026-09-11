export default function MarginGuard({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section
      className="
            w-full
            @md:max-w-[700px] 
            @lg:max-w-[1000px]
        "
    >
      {children}
    </section>
  )
}
