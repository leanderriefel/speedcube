import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react"
import { eq, useLiveQuery, type CollectionStatus } from "@tanstack/react-db"
import { createIsomorphicFn } from "@tanstack/react-start"

import { sessionCollection } from "~/lib/db"

const storageKey = "speedcube-session-id"

type SessionContextValue = {
  session: {
    data: { id: string; name: string } | undefined
    status: CollectionStatus
    isLoading: boolean
    isReady: boolean
    isIdle: boolean
    isError: boolean
    isCleanedUp: boolean
    isEnabled: true
  }
  setSessionId: (id: string) => void
}

const pendingContextValue: SessionContextValue = {
  session: {
    data: undefined,
    status: "idle" as CollectionStatus,
    isLoading: false,
    isReady: false,
    isIdle: true,
    isError: false,
    isCleanedUp: false,
    isEnabled: true,
  },
  setSessionId: () => {},
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const SessionContext = createContext<SessionContextValue>(null!)

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <SessionContext.Provider value={pendingContextValue}>
        {children}
      </SessionContext.Provider>
    )
  }

  return <ClientSessionProvider>{children}</ClientSessionProvider>
}

const findSession = createIsomorphicFn().client(() => {
  const storageValue = localStorage.getItem(storageKey)
  if (storageValue) return storageValue

  const id = crypto.randomUUID()
  localStorage.setItem(storageKey, id)
  sessionCollection.insert({
    id,
    name: `Session ${new Date().toLocaleDateString()}`,
  })
  return id
})

const ClientSessionProvider = ({ children }: PropsWithChildren) => {
  const [sessionId, _setSessionId] = useState(findSession)

  const setSessionId = useCallback((id: string) => {
    localStorage.setItem(storageKey, id)
    _setSessionId(id)
  }, [])

  const session = useLiveQuery(
    (q) =>
      q
        .from({ sessions: sessionCollection })
        .where(({ sessions }) => eq(sessions.id, sessionId))
        .findOne(),
    [sessionId],
  )

  useEffect(() => {
    if (!session.isReady || session.data) return

    localStorage.removeItem(storageKey)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    _setSessionId(findSession())
  }, [session.isReady, session.data, _setSessionId])

  return (
    <SessionContext.Provider value={{ session, setSessionId }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used within a SessionProvider")
  return ctx
}
