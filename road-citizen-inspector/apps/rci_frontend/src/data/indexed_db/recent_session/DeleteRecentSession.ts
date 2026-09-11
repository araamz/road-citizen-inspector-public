import { db } from '@/integrations/dexie/RecentSessions.db'

export const deleteRecentSession = async (sessionId: number) => {
  const recentSession = await db.sessions
    .where('sessionId')
    .equals(sessionId)
    .first()
  if (!recentSession)
    throw new Error(
      'Unable to delete bookmarked session. Bookmarked session was not found or is corrupted.',
    )
  return db.sessions.delete(recentSession.id)
}
