import type { RecentSession } from '@/integrations/dexie/RecentSessions.db'
import { Link } from '@tanstack/react-router'
import { HiFolder } from 'react-icons/hi2'
import WidgetItem from '../../WidgetItem'

export type FavoriteSessionItemProps = {
  recentSessionItem: RecentSession
}
export default function FavoriteSessionItem({
  recentSessionItem,
}: FavoriteSessionItemProps) {
  return (
    <Link
      className='group'
      to="/session/$sessionId"
      params={{
        sessionId: String(recentSessionItem.sessionId),
      }}
    >
      <WidgetItem icon={HiFolder} descriptor={recentSessionItem.session.tts_app_id || undefined}>
        {recentSessionItem.personalizedName || recentSessionItem.session.title}
      </WidgetItem>
    </Link>
  )
}