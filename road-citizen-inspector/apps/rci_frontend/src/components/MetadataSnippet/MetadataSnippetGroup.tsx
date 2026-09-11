import type { ReactElement } from 'react'
import type { MetadataSnippetProps } from './MetadataSnippet'

export type MetadataSnippetGroupProps = {
  children: Array<ReactElement<MetadataSnippetProps>> | ReactElement<MetadataSnippetProps>
}
export default function MetadataSnippetGroup({
  children,
}: MetadataSnippetGroupProps) {
  return (
    <div className=" w-full flex items-center gap-2 *:border-l-2 *:border-l-neutral-400 *:first:border-l-0 *:first:pl-0 *:pl-2">
      {children}
    </div>
  )
}
