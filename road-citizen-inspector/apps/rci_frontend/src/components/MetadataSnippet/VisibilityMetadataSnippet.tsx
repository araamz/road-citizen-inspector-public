import type { SessionVisibilityStatus } from "@road-citizen-inspector/models/session"
import MetadataSnippet from "./MetadataSnippet"
import { HiMiniLockClosed, HiMiniLockOpen } from "react-icons/hi2"

export type VisibilityMetadataSnippetProps = {
    visibility: SessionVisibilityStatus
}
export default function VisibilityMetadataSnippet({visibility}: VisibilityMetadataSnippetProps) {
    if (visibility === 'private') return <MetadataSnippet label="Private" icon={HiMiniLockClosed} />
    else return <MetadataSnippet label="Public" icon={HiMiniLockOpen} /> 
}