import type { RefObject } from "react"

import { cn } from "~/lib"

type TimerDisplayProps = {
  timerRef: RefObject<HTMLParagraphElement>
  holdingReady: boolean
  startReady: boolean
}

export const TimerDisplay = ({
  timerRef,
  holdingReady,
  startReady,
}: TimerDisplayProps) => (
  <p
    ref={timerRef}
    className={cn("font-mono text-5xl sm:text-7xl", {
      "text-warning": holdingReady,
      "text-success": startReady,
      "text-foreground": !holdingReady && !startReady,
    })}
  >
    00.00
  </p>
)
