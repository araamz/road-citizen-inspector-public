import { db } from '@/integrations/dexie/RecentSessions.db'

export const queryRecentSessions = async () => {
  return db.sessions.toArray()
}
