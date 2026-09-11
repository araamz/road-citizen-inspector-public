import { BsFillPinAngleFill } from 'react-icons/bs'
import MetadataSnippet from './MetadataSnippet'

export type DevicePinnedMetadataSnippetProps = {
  isPinned: boolean
}
export default function DevicePinnedMetadataSnippet({
  isPinned,
}: DevicePinnedMetadataSnippetProps) {
  if (isPinned)
    return <MetadataSnippet label="Pinned" icon={BsFillPinAngleFill} />
  else return undefined
}
