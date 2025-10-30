import { useMemo, useRef, useState } from "react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { useVirtualizer } from "@tanstack/react-virtual"

import { useSession } from "~/components/session-provider"
import { cn, formatTime } from "~/lib"
import { average } from "~/lib/calc"
import { solveCollection } from "~/lib/db"
import { Checkbox } from "./ui/checkbox"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu"

export const SolvesList = () => {
  const { session } = useSession()
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const solves = useLiveQuery(
    (q) =>
      q
        .from({ solves: solveCollection })
        .where(({ solves }) => eq(solves.sessionId, session.data?.id))
        .orderBy(({ solves }) => solves.date, "desc"),
    [session.data?.id],
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

  const [selection, setSelection] = useState<Set<string>>(new Set())

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

  const paddingTop = virtualRows.length > 0 ? (virtualRows[0]?.start ?? 0) : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0

  return (
    <div ref={tableContainerRef} className="min-h-0 flex-1 overflow-y-auto">
      <table className="w-full table-fixed text-center text-sm">
        <thead>
          <tr
            className={cn(
              "*:sticky *:top-0 *:z-10 *:bg-background *:px-6 *:py-2 *:font-medium",
              "*:after:absolute *:after:right-0 *:after:bottom-0 *:after:left-0 *:after:h-px *:after:bg-border",
            )}
            style={{
              height: `${virtualRows[0]?.size ?? 42}px`,
            }}
          >
            <th className="text-muted-foreground">
              {selection.size > 0 ? (
                <Checkbox
                  className="size-5 rounded-[8px] border-2! border-border transition-all duration-100"
                  checked={selection.size === solvesData.length}
                  onClick={() =>
                    setSelection((prev) => {
                      const newSelection = new Set(prev)
                      if (newSelection.size === solvesData.length) {
                        newSelection.clear()
                      } else {
                        solvesData.forEach((solve) => {
                          newSelection.add(solve.id)
                        })
                      }
                      return newSelection
                    })
                  }
                />
              ) : (
                "#"
              )}
            </th>
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
              <ContextMenu key={solve.id}>
                <ContextMenuTrigger asChild>
                  <tr
                    className={cn(
                      "cursor-pointer border-b border-border *:px-6 *:py-2 *:whitespace-nowrap *:select-none",
                      {
                        "bg-secondary": selection.has(solve.id),
                      },
                    )}
                    style={{ height: `${virtualRow.size}px` }}
                    onClick={() =>
                      setSelection((prev) => {
                        const newSelection = new Set(prev)
                        if (newSelection.has(solve.id)) {
                          newSelection.delete(solve.id)
                        } else {
                          newSelection.add(solve.id)
                        }
                        return newSelection
                      })
                    }
                  >
                    <td
                      className="flex size-full items-center justify-center text-muted-foreground"
                      style={{ height: `${virtualRow.size}px` }}
                    >
                      {selection.size > 0 ? (
                        <Checkbox
                          className="size-5 rounded-[8px] border-2! border-border transition-all duration-100"
                          checked={selection.has(solve.id)}
                        />
                      ) : (
                        displayIndex
                      )}
                    </td>
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
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() =>
                      navigator.clipboard.writeText(
                        typeof solve.time === "number"
                          ? formatTime(solve.time)
                          : "DNF",
                      )
                    }
                  >
                    Copy time
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `Time: ${typeof solve.time === "number" ? formatTime(solve.time) : "DNF"}; Scramble: ${solve.scramble}; Date: ${solve.date.toISOString()}; Event: ${solve.event}`,
                      )
                    }
                  >
                    Copy solve
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => solveCollection.delete(solve.id)}
                    variant="destructive"
                  >
                    Delete solve
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
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
  )
}
