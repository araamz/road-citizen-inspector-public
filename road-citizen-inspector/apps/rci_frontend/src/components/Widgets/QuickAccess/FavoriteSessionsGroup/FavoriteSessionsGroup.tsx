import useRecentSessions from '@/hooks/queries/recent_session/UseRecentSessions'
import QuickAccessGroup from '../QuickAccessGroup'
import { useQuery } from '@tanstack/react-query'
import FavoriteSessionItem from './FavoriteSessionItem'

export default function FavoriteSessionsGroup() {
  const { data } = useQuery(useRecentSessions())

  const favoritedRecentSessions = (
    data && data.filter(item => item.isFavorite === 'yes').length > 0 
  )

  if (!favoritedRecentSessions) return undefined

  return (
    <QuickAccessGroup label="Favorited Sessions">
      {
        favoritedRecentSessions
          ? data.filter(item => item.isFavorite === 'yes').map((recentSession => <FavoriteSessionItem key={recentSession.sessionId} recentSessionItem={recentSession} />)) : undefined 
      }
    </QuickAccessGroup>
  )
}
