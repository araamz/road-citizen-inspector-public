import { db } from '@/integrations/dexie/RecentSessions.db'
import { RecentSessionError } from './RecentSessionError'

export const queryRecentSession = async (sessionId: number) => {
  const recentSession = await db.sessions
    .where('sessionId')
    .equals(sessionId)
    .first()
  if (!recentSession)
    throw new RecentSessionError(
      'Unable to get bookmarked session. Bookmarked session was not found or is corrupted.',
    )
  return recentSession
}
