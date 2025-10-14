import { eq, useLiveQuery } from "@tanstack/react-db"

import { useSession } from "~/components/session-provider"
import { cn, formatTime } from "~/lib"
import { solveCollection } from "~/lib/db"

export const SessionDisplay = () => {
  const { session } = useSession()

  const solves = useLiveQuery(
    (q) =>
      q
        .from({ solves: solveCollection })
        .where(({ solves }) => eq(solves.sessionId, session.data?.id))
        .orderBy(({ solves }) => solves.date, "desc"),
    [session.data?.id],
  )

  return (
    <div className="absolute bottom-8 left-8">
      <h2 className="mb-3 text-lg font-semibold">
        {session.data?.name}
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          ({solves.data?.length} solves)
        </span>
      </h2>
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="">
            <tr
              className={cn(
                "*:sticky *:top-0 *:z-10 *:bg-background *:px-4 *:py-2 *:text-left *:font-medium *:text-muted-foreground",
                "*:after:absolute *:after:right-0 *:after:bottom-0 *:after:left-0 *:after:h-px *:after:bg-border",
              )}
            >
              <th>Index</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {solves.data?.map((solve, index) => (
              <tr key={solve.id} className="*:px-4 *:py-2 *:whitespace-nowrap">
                <td>{solves.data?.length - index}</td>
                <td>{Intl.DateTimeFormat().format(solve.date)}</td>
                <td className="font-mono">{formatTime(solve.time ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
