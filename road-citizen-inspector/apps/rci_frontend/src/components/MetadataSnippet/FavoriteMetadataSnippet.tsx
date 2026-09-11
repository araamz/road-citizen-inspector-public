import type { IsFavoriteField } from "@/integrations/dexie/RecentSessions.db"
import MetadataSnippet from "./MetadataSnippet"
import { HiMiniStar } from "react-icons/hi2"

export type FavroiteMetadataSnippetProps = {
    isFavorite: IsFavoriteField
}
export default function FavoriteMetadataSnippet({isFavorite}: FavroiteMetadataSnippetProps) {
    if (isFavorite === 'yes') return <MetadataSnippet label="Favorite" icon={HiMiniStar} />
    else return undefined
}