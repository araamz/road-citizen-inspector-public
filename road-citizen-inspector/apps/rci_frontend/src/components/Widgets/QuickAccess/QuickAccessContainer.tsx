import { useQuery } from '@tanstack/react-query'
import FavoriteSessionsGroup from './FavoriteSessionsGroup/FavoriteSessionsGroup'
import PriamryLinkGroup from './PrimaryLinkGroup/PrimaryLinkGroup'
import useRecentSessions from '@/hooks/queries/recent_session/UseRecentSessions'

export default function QuickAccessContainer() {
  const { data: favoritedSessions } = useQuery(useRecentSessions())

  return (
    <div className="flex flex-col gap-10">
      <PriamryLinkGroup />
      {favoritedSessions && favoritedSessions.length > 0 ? (
        <FavoriteSessionsGroup />
      ) : null}
    </div>
  )
}
