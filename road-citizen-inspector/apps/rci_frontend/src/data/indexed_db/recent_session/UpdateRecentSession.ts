import { db, type RecentSession } from '@/integrations/dexie/RecentSessions.db'

export const updateRecentSession = async (
  sessionId: number,
  updatedRecentSession: Partial<RecentSession>,
) => {
  console.log('updateRecentSession', updatedRecentSession)
  const recentSession = await db.sessions
    .where('sessionId')
    .equals(sessionId)
    .first()
  if (!recentSession) throw new Error('Failed to update recent session.')
  return db.sessions
    .update(recentSession.id, {
      ...updatedRecentSession,
    })
    .then((value) => {
      console.log('updateRecentSession - post', value)
      return value
    })
}
