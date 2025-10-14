import { ClientOnly, createFileRoute } from "@tanstack/react-router"

import { ScrambleDisplay } from "~/components/scramble-display"
import { SessionDisplay } from "~/components/session-display"
import { SessionProvider, useSession } from "~/components/session-provider"
import { TimerDisplay } from "~/components/timer-display"
import { Spinner } from "~/components/ui/spinner"
import { useTimerController } from "~/hooks/useTimerController"
import { solveCollection } from "~/lib/db"
import { useScramble } from "~/lib/scramble"

const Home = () => {
  const { session } = useSession()

  const scramble = useScramble("333")
  const timer = useTimerController({
    onSolve: (solve) => {
      scramble.refetch()

      solveCollection.insert({
        ...solve,
        scramble: scramble.data?.toString() ?? "",
        sessionId: session.data?.id ?? "",
        date: new Date(),
        id: crypto.randomUUID(),
      })
    },
  })

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {session.data && (
        <>
          <ScrambleDisplay
            scramble={scramble}
            onClick={() => scramble.refetch()}
          />
          <SessionDisplay />
          <TimerDisplay {...timer} />
        </>
      )}
      {!session.data && <Spinner className="size-8" />}
    </main>
  )
}

const HomeRoute = () => {
  return (
    <ClientOnly
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <SessionProvider>
        <Home />
      </SessionProvider>
    </ClientOnly>
  )
}

export const Route = createFileRoute("/")({
  component: HomeRoute,
  ssr: false,
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="size-8" />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-red-500">An error occurred: {error.message}</p>
    </div>
  ),
})
