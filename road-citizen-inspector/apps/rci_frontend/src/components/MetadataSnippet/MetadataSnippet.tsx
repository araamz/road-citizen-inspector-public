import type { IconType } from 'react-icons'

export type MetadataSnippetProps = {
  label: string
  icon: IconType
}
export default function MetadataSnippet({
  label,
  icon: Icon,
}: MetadataSnippetProps) {
  return (
      <div className="text-neutral-400 flex flex-row gap-1.5 items-center">
        <Icon />
        <p className="hidden @sm:block text-xs tracking-wider uppercase">
          {label}
        </p>
    </div>
  )
}
