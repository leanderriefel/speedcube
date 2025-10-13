import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { ScrambleDisplay } from "~/components/scramble-display"
import { SessionDisplay } from "~/components/session-display"
import { useSession } from "~/components/session-provider"
import { TimerDisplay } from "~/components/timer-display"
import { Spinner } from "~/components/ui/spinner"
import { useTimerController } from "~/hooks/useTimerController"
import { solveCollection } from "~/lib/db"
import { useScramble } from "~/lib/scramble"
import { SessionProvider } from "~/components/session-provider"

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
    <main className="relative min-h-screen overflow-hidden bg-background flex flex-col items-center justify-center">
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
        <div className="flex items-center justify-center min-h-screen">
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
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="size-8" />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500">An error occurred: {error.message}</p>
    </div>
  ),
})
