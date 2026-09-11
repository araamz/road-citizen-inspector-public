import { db } from '@/integrations/dexie/RecentSessions.db'
import type { SessionData } from '@road-citizen-inspector/contracts'

export const addNewRecentSession = async (
  sessionId: number,
  createdSession: SessionData,
) => {
  return db.sessions.add({
    sessionId: sessionId,
    session: createdSession,
    personalizedName: null,
    isFavorite: 'no',
  })
}
