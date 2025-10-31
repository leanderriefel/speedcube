import { useMemo, useRef, useState } from "react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { useVirtualizer } from "@tanstack/react-virtual"
import { MoreVerticalIcon } from "lucide-react"

import { useSession } from "~/components/session-provider"
import { cn, formatTime } from "~/lib"
import { average } from "~/lib/calc"
import { solveCollection } from "~/lib/db"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  count,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: number
  onConfirm: () => void
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete solves</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {count} solves? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
  const solvesData = useMemo(() => solves.data ?? [], [solves.data])

  const paddingTop = virtualRows.length > 0 ? (virtualRows[0]?.start ?? 0) : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0

  const [selection, setSelection] = useState<Set<string>>(new Set())
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const selectedSolves = useMemo(() => {
    return solvesData.filter((solve) => selection.has(solve.id))
  }, [solvesData, selection])

  const bulkActions = {
    copyTimes: () => {
      navigator.clipboard.writeText(
        selectedSolves
          .map((s) => (typeof s.time === "number" ? formatTime(s.time) : "DNF"))
          .join("\n"),
      )
      setSelection(new Set())
    },
    copySolves: () => {
      navigator.clipboard.writeText(
        selectedSolves
          .map(
            (s) =>
              `Time: ${typeof s.time === "number" ? formatTime(s.time) : "DNF"}; Scramble: ${s.scramble}; Date: ${s.date.toISOString()}; Event: ${s.event}`,
          )
          .join("\n"),
      )
      setSelection(new Set())
    },
    delete: () => {
      selectedSolves.forEach((s) => solveCollection.delete(s.id))
      setSelection(new Set())
    },
  }

  const handleDelete = () => {
    if (selection.size > 1) {
      setConfirmDeleteOpen(true)
    } else {
      bulkActions.delete()
    }
  }

  return (
    <div ref={tableContainerRef} className="min-h-0 flex-1 overflow-y-auto">
      <table className="w-full text-center text-sm">
        <thead>
          <tr
            className={cn(
              "*:sticky *:top-0 *:z-10 *:bg-background *:py-2 *:font-medium",
              "*:after:absolute *:after:right-0 *:after:bottom-0 *:after:left-0 *:after:h-px *:after:bg-border",
            )}
            style={{
              height: `${virtualRows[0]?.size ?? 42}px`,
            }}
          >
            <th
              className="p-2"
              style={{ width: `${virtualRows[0]?.size ?? 42}px` }}
            >
              <div
                className="flex size-full cursor-pointer items-center justify-center"
                onClick={() => {
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
                }}
              >
                <Checkbox
                  className="pointer-events-none size-5 rounded-[8px] border-2! border-border transition-all duration-100"
                  checked={selection.size > 0}
                  variant={
                    selection.size > 0 && selection.size < solvesData.length
                      ? "indeterminate"
                      : "default"
                  }
                />
              </div>
            </th>
            <th
              className="p-2 text-muted-foreground"
              style={{ width: `${virtualRows[0]?.size ?? 42}px` }}
            >
              #
            </th>
            <th className="px-6 text-center">Time</th>
            <th className="px-6 text-center">ao5</th>
            <th className="px-6 text-center">ao12</th>
            <th
              className="p-2"
              style={{ width: `${virtualRows[0]?.size ?? 42}px` }}
            >
              {selection.size > 0 && (
                <div className="flex size-full items-center justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-6 rounded-[8px]"
                      >
                        <MoreVerticalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        {selection.size} solves selected
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={bulkActions.copyTimes}>
                        Copy times
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={bulkActions.copySolves}>
                        Copy solves
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDelete}
                        variant="destructive"
                      >
                        Delete solves
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {paddingTop > 0 ? (
            <tr style={{ height: `${paddingTop}px` }}>
              <td colSpan={6} />
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
                      "cursor-pointer border-b border-border *:whitespace-nowrap *:select-none",
                      {
                        "bg-secondary/50": selection.has(solve.id),
                      },
                    )}
                    style={{ height: `${virtualRow.size}px` }}
                  >
                    <td
                      className="p-2"
                      style={{ width: `${virtualRow.size}px` }}
                      onClick={(e) => {
                        e.stopPropagation()

                        setSelection((prev) => {
                          const newSelection = new Set(prev)
                          if (newSelection.has(solve.id)) {
                            newSelection.delete(solve.id)
                          } else {
                            newSelection.add(solve.id)
                          }
                          return newSelection
                        })
                      }}
                    >
                      <div className="flex size-full cursor-pointer items-center justify-center">
                        <Checkbox
                          className="pointer-events-none size-5 rounded-[8px] border-2! border-border transition-all duration-100"
                          checked={selection.has(solve.id)}
                        />
                      </div>
                    </td>
                    <td
                      className="p-2 text-center text-muted-foreground"
                      style={{ width: `${virtualRow.size}px` }}
                    >
                      {displayIndex}
                    </td>
                    <td className="px-6 text-center font-mono">
                      {typeof solve.time === "undefined"
                        ? "DNF"
                        : formatTime(solve.time)}
                    </td>
                    <td className="px-6 text-center font-mono">
                      {rollingAverages.ao5[solveIndex]}
                    </td>
                    <td className="px-6 text-center font-mono">
                      {rollingAverages.ao12[solveIndex]}
                    </td>
                    <td
                      className="p-2"
                      style={{ width: `${virtualRow.size}px` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex size-full items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="size-6 rounded-[8px]"
                            >
                              <MoreVerticalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  typeof solve.time === "number"
                                    ? formatTime(solve.time)
                                    : "DNF",
                                )
                              }
                            >
                              Copy time
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  `Time: ${typeof solve.time === "number" ? formatTime(solve.time) : "DNF"}; Scramble: ${solve.scramble}; Date: ${solve.date.toISOString()}; Event: ${solve.event}`,
                                )
                              }
                            >
                              Copy solve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => solveCollection.delete(solve.id)}
                              variant="destructive"
                            >
                              Delete solve
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
              <td colSpan={6} />
            </tr>
          ) : null}
        </tbody>
      </table>
      <DeleteConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        count={selection.size}
        onConfirm={bulkActions.delete}
      />
    </div>
  )
}
