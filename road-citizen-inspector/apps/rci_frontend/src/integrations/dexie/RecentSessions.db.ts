import type { SessionData } from '@road-citizen-inspector/contracts'
import Dexie, { type EntityTable } from 'dexie'

export type IsFavoriteField = 'yes' | 'no'
interface RecentSession {
  id: number,
  sessionId: number
  personalizedName: string | null
  isFavorite: IsFavoriteField
  session: SessionData
}

const db = new Dexie('RecentSessionsDatabase') as Dexie & {
  sessions: EntityTable<RecentSession, 'id'>
}

db.version(1).stores({
  sessions: '++id, sessionId, personalizedName, isFavorite, session',
})

type RecentSessionsDatabase = typeof db

export type { RecentSession, RecentSessionsDatabase }
export { db }
