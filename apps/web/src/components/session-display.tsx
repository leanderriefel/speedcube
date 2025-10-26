import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { useVirtualizer } from "@tanstack/react-virtual"
import { ChevronDownIcon } from "lucide-react"

import { useSession } from "~/components/session-provider"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { cn, formatTime } from "~/lib"
import { average } from "~/lib/calc"
import { sessionCollection, solveCollection } from "~/lib/db"

export const SessionDisplay = () => {
  const { session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(() => session.data?.name || "")
  const inputRef = useRef<HTMLInputElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const { setSessionId } = useSession()

  const solves = useLiveQuery(
    (q) =>
      q
        .from({ solves: solveCollection })
        .where(({ solves }) => eq(solves.sessionId, session.data?.id))
        .orderBy(({ solves }) => solves.date, "desc"),
    [session.data?.id],
  )

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

  type CalcSolveResult = Parameters<typeof average>[0][number]

  const solveResults = useMemo<CalcSolveResult[]>(() => {
    if (!solves.data) return []
    return solves.data.map((solve) =>
      typeof solve.time === "number"
        ? { time: solve.time, dnf: false as const }
        : { time: undefined, dnf: true as const },
    )
  }, [solves.data])

  const rollingAverages = useMemo(() => {
    const compute = (windowSize: number) => {
      const formatted = new Array<string>(solveResults.length).fill("—")
      if (windowSize === 0 || solveResults.length < windowSize) return formatted

      const buffer = new Array<CalcSolveResult>(windowSize)

      for (
        let start = 0;
        start + windowSize <= solveResults.length;
        start += 1
      ) {
        for (let offset = 0; offset < windowSize; offset += 1) {
          buffer[offset] = solveResults[start + offset]
        }

        const result = average(buffer)

        formatted[start] =
          result.dnf || typeof result.time === "undefined"
            ? "DNF"
            : formatTime(result.time)
      }

      return formatted
    }

    return {
      ao5: compute(5),
      ao12: compute(12),
    }
  }, [solveResults])

  const rowCount = solves.data?.length ?? 0

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 42,
    overscan: 50,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()
  const solvesData = solves.data ?? []

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    if (session.data?.name) {
      setEditName(session.data.name)
    }
  }, [session.data?.id, session.data?.name])

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
            value={editName}
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

      <div ref={tableContainerRef} className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full table-fixed text-center text-sm">
          <thead>
            <tr
              className={cn(
                "*:sticky *:top-0 *:z-10 *:bg-background *:px-6 *:py-2 *:font-medium",
                "*:after:absolute *:after:right-0 *:after:bottom-0 *:after:left-0 *:after:h-px *:after:bg-border",
              )}
            >
              <th className="text-muted-foreground">#</th>
              <th>Time</th>
              <th>ao5</th>
              <th>ao12</th>
            </tr>
          </thead>
          <tbody>
            {paddingTop > 0 ? (
              <tr style={{ height: `${paddingTop}px` }}>
                <td colSpan={4} />
              </tr>
            ) : null}
            {virtualRows.map((virtualRow) => {
              const solveIndex = virtualRow.index
              const solve = solvesData[solveIndex]

              if (!solve) return null

              const displayIndex = solvesData.length - solveIndex

              return (
                <tr
                  key={solve.id}
                  className="border-b border-border *:px-6 *:py-2 *:whitespace-nowrap"
                  style={{ height: `${virtualRow.size}px` }}
                >
                  <td className="text-muted-foreground">{displayIndex}</td>
                  <td className="font-mono">
                    {typeof solve.time === "undefined"
                      ? "DNF"
                      : formatTime(solve.time)}
                  </td>
                  <td className="font-mono">
                    {rollingAverages.ao5[solveIndex]}
                  </td>
                  <td className="font-mono">
                    {rollingAverages.ao12[solveIndex]}
                  </td>
                </tr>
              )
            })}
            {paddingBottom > 0 ? (
              <tr style={{ height: `${paddingBottom}px` }}>
                <td colSpan={4} />
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
