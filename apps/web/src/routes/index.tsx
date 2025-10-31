import { useEffect, useState } from "react"
import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { PanelLeftOpenIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { ScrambleDisplay } from "~/components/scramble-display"
import { SessionDisplay } from "~/components/session-display"
import { SessionProvider, useSession } from "~/components/session-provider"
import { TimerDisplay } from "~/components/timer-display"
import { Button } from "~/components/ui/button"
import { Sheet, SheetContent } from "~/components/ui/sheet"
import { Spinner } from "~/components/ui/spinner"
import { useScrambleHistory } from "~/hooks/useScrambleHistory"
import { useTimerController } from "~/hooks/useTimerController"
import { cn } from "~/lib"
import { solveCollection } from "~/lib/db"

const Home = () => {
  const { session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(max-width: 1023px)").matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)")

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

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
    <main className="relative flex h-dvh justify-center overflow-hidden">
      {/* Mobile Sheet (max-lg) */}
      {isMobile && (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent
            side="left"
            className="w-md! max-w-md! p-0"
            showCloseButton={false}
          >
            <SessionDisplay
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Sidebar (lg+) */}
      <motion.div
        initial={false}
        animate={{
          width: isSidebarOpen ? "calc(var(--spacing)*112)" : 0,
          opacity: isSidebarOpen ? 1 : 0,
          filter: isSidebarOpen ? "blur(0px)" : "blur(5px)",
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={cn(
          "relative flex shrink-0 overflow-hidden max-lg:hidden",
          !isSidebarOpen && "pointer-events-none",
        )}
      >
        <div className="absolute inset-y-0 left-0 w-md min-w-0 will-change-transform">
          <SessionDisplay
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>
      </motion.div>

      <div className="grid size-full grid-rows-[auto_1fr] items-center border-l text-center">
        <div className="relative">
          <AnimatePresence>
            {!isSidebarOpen && (
              <motion.div
                key="sidebar-toggle-open"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="absolute top-1/2 left-4 z-50 -translate-y-1/2 sm:left-8"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <PanelLeftOpenIcon className="size-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <ScrambleDisplay scrambleHistory={scrambleHistory} />
        </div>
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
