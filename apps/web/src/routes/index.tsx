import { ClientOnly, createFileRoute } from "@tanstack/react-router"

import { ScrambleDisplay } from "~/components/scramble-display"
import { SessionDisplay } from "~/components/session-display"
import { SessionProvider, useSession } from "~/components/session-provider"
import { TimerDisplay } from "~/components/timer-display"
import { Spinner } from "~/components/ui/spinner"
import { useScrambleHistory } from "~/hooks/useScrambleHistory"
import { useTimerController } from "~/hooks/useTimerController"
import { solveCollection } from "~/lib/db"

const Home = () => {
  const { session } = useSession()

  const scrambleHistory = useScrambleHistory("333")
  const timer = useTimerController({
    onSolve: (solve) => {
      scrambleHistory.goToNext()

      solveCollection.insert({
        ...solve,
        scramble: scrambleHistory.currentScramble ?? "",
        sessionId: session.data?.id ?? "",
        date: new Date(),
        id: crypto.randomUUID(),
      })
    },
  })

  if (!session.data) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
        <Spinner className="size-8" />
      </main>
    )
  }

  return (
    <main className="relative grid h-dvh grid-cols-[calc(var(--spacing)*112)_1fr] items-center justify-center overflow-hidden">
      <SessionDisplay />
      <div className="grid size-full grid-rows-[auto_1fr] items-center border-l text-center">
        <ScrambleDisplay scrambleHistory={scrambleHistory} />
        <TimerDisplay {...timer} />
      </div>
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
