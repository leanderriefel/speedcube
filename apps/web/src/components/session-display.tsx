import { useCallback, useRef, useState } from "react"
import { useLiveQuery } from "@tanstack/react-db"
import { ChevronDownIcon, PanelLeftCloseIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { useSession } from "~/components/session-provider"
import { SolvesList } from "~/components/solves-list"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { cn } from "~/lib"
import { sessionCollection } from "~/lib/db"

type SessionDisplayProps = {
  isOpen: boolean
  onToggle: () => void
}

export const SessionDisplay = ({ isOpen, onToggle }: SessionDisplayProps) => {
  const { session, setSessionId } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(() => session.data?.name || "")
  const inputRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const currentSessionId = session.data?.id
  const displayValue = isEditing ? editName : (session.data?.name ?? "")

  const newSession = useCallback(() => {
    const id = crypto.randomUUID()
    const name = `Session ${new Date().toLocaleDateString()}`
    sessionCollection.insert({ id, name, date: new Date() })
    setSessionId(id)
    return { id, name }
  }, [setSessionId])

  const sessions = useLiveQuery(
    (q) =>
      q
        .from({ sessions: sessionCollection })
        .orderBy(({ sessions }) => sessions.date, "asc"),
    [],
  )

  const handleStartEdit = () => {
    setEditName(session.data?.name || "")
    setIsEditing(true)
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  const handleSaveEdit = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = undefined
    }

    if (editName.trim() && editName !== session.data?.name && session.data) {
      sessionCollection.update(session.data.id, (draft) => {
        draft.name = editName.trim()
      })
    }
    setIsEditing(false)
    inputRef.current?.blur()
  }

  const handleCancelEdit = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = undefined
    }
    setEditName(session.data?.name || "")
    setIsEditing(false)
    inputRef.current?.blur()
  }

  const handleBlur = () => {
    handleSaveEdit()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      handleSaveEdit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      handleCancelEdit()
    }
  }

  const deleteSession = () => {
    const sessionId = session.data?.id
    if (!sessionId) return
    if (sessions.data?.length === 1) return

    const nextSessionId = sessions.data.find((s) => s.id !== sessionId)?.id
    if (!nextSessionId) return

    sessionCollection.delete(sessionId)
    setSessionId(nextSessionId)
  }

  return (
    <div className="flex h-full min-h-0 flex-col self-stretch overflow-hidden pt-4 sm:pt-8">
      <div className="mb-4 flex w-full items-center justify-between gap-x-4 px-4 sm:mb-8 sm:px-8">
        <h2 className="text-lg font-semibold">
          <input
            key={currentSessionId}
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={(e) => {
              if (isEditing) {
                setEditName(e.target.value)
              }
            }}
            onFocus={handleStartEdit}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            maxLength={24}
            enterKeyHint="done"
            className={cn(
              "cursor-text border-none bg-transparent p-0 font-semibold outline-none",
              {
                "cursor-text underline underline-offset-4": isEditing,
              },
            )}
          />
        </h2>
        <div className="flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                {sessions.data?.map((session) => (
                  <DropdownMenuItem
                    key={session.id}
                    onClick={() => setSessionId(session.id)}
                  >
                    {session.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => newSession()}>
                  Create new session
                </DropdownMenuItem>
                {sessions.data?.length > 1 && (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => deleteSession()}
                  >
                    Delete current session
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="sidebar-toggle-close"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <Button variant="ghost" size="icon" onClick={onToggle}>
                  <PanelLeftCloseIcon className="size-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SolvesList />
    </div>
  )
}
