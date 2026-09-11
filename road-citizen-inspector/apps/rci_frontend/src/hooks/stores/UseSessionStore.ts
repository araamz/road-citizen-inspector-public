import { create } from 'zustand'
import type { SessionData } from '@road-citizen-inspector/contracts'

type SessionUpdateParams = Partial<
  Pick<
    SessionData,
    'title' | 'description' | 'visibility' | 'updated_at' | 'active_at'
  >
>

export type SessionRole = 'viewer' | 'administrator'

interface SessionStoreState {
  role: SessionRole | null
  session: SessionData | null
  setSession: (role: SessionRole, session: SessionData) => void
  clearSession: () => void
  updateSession: (updatedSession: SessionUpdateParams) => void
}

const useSessionStore = create<SessionStoreState>()((set) => ({
  role: null,
  session: null,
  setSession: (role: SessionRole, session: SessionData) =>
    set(() => ({
      role: role,
      session: session,
    })),
  clearSession: () => set(() => ({ role: null, session: null })),
  updateSession: (updatedSession: SessionUpdateParams) =>
    set((state) => {
      if (state.session === null) return state
      else
        return {
          ...state,
          session: {
            ...state.session,
            ...updatedSession,
          },
        }
    }),
}))

export type { SessionUpdateParams, SessionStoreState }
export { useSessionStore }
