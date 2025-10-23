import type { RefObject } from "react"

import Background from "~/components/background"
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
}: TimerDisplayProps) => {
  return (
    <div className="relative flex size-full grow items-center justify-center">
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
      <Background
        speed={2.5}
        scale={1}
        color="#7F7F7F"
        noiseIntensity={5}
        rotation={0}
      />
    </div>
  )
}
