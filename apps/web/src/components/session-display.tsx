import { useCallback, useEffect, useRef, useState } from "react"
import { useLiveQuery } from "@tanstack/react-db"
import { ChevronDownIcon } from "lucide-react"

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

export const SessionDisplay = () => {
  const { session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(() => session.data?.name || "")
  const inputRef = useRef<HTMLInputElement>(null)

  const { setSessionId } = useSession()

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

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (editName.trim() && editName !== session.data?.name && session.data) {
      sessionCollection.update(session.data.id, (draft) => {
        draft.name = editName.trim()
      })
    }
    setIsEditing(false)
    inputRef.current?.blur()
  }

  const handleCancelEdit = () => {
    setEditName(
      session.data?.name || `Session ${new Date().toLocaleDateString()}	`,
    )
    setIsEditing(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveEdit()
    } else if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col self-stretch overflow-hidden pt-4 sm:pt-8">
      <div className="mb-4 flex w-full items-center justify-between gap-x-4 px-4 sm:mb-8 sm:px-8">
        <h2 className="text-lg font-semibold">
          <input
            ref={inputRef}
            type="text"
            value={isEditing ? editName : (session.data?.name ?? "")}
            onChange={(e) => setEditName(e.target.value)}
            onFocus={handleStartEdit}
            onBlur={handleSaveEdit}
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
                <DropdownMenuItem>Delete current session</DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SolvesList />
    </div>
  )
}
