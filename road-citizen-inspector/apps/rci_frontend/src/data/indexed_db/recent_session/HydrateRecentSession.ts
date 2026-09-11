import { db } from '@/integrations/dexie/RecentSessions.db'
import type { SessionData } from '@road-citizen-inspector/contracts'

export const hydrateRecentSession = async (
  sessionId: number,
  hydratedSession: SessionData,
) => {
  const recentSession = await db.sessions
    .where('sessionId')
    .equals(sessionId)
    .first()
  if (!recentSession) return null
  return db.sessions.update(recentSession.id, {
    session: hydratedSession,
  })
}
