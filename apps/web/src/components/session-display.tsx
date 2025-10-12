import { eq, useLiveQuery } from "@tanstack/react-db"
import { useSession } from "~/components/session-provider"
import { formatTime } from "~/lib"
import { solveCollection } from "~/lib/db"

export const SessionDisplay = () => {
  const { session } = useSession()

  const solves = useLiveQuery(
    (q) =>
      q
        .from({ solves: solveCollection })
        .where(({ solves }) => eq(solves.sessionId, session.data?.id))
        .orderBy(({ solves }) => solves.date, "desc"),
    [session.data?.id]
  )

  return (
    <div className="absolute bottom-8 left-8">
      <h2 className="text-lg font-semibold mb-3">{session.data?.name}</h2>
      <div className="max-h-96 overflow-y-auto">
        <table className="text-sm w-full ">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                Index
              </th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {solves.data?.map((solve, index) => (
              <tr key={solve.id}>
                <td className="px-4 py-2 whitespace-nowrap">
                  {solves.data?.length - index}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {Intl.DateTimeFormat().format(solve.date)}
                </td>
                <td className="px-4 py-2 font-mono whitespace-nowrap">
                  {formatTime(solve.time ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
