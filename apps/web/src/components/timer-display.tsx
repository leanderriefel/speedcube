"use client"

import { type RefObject } from "react"

import { cn } from "~/lib"

type TimerDisplayProps = {
  timerRef: RefObject<HTMLParagraphElement>
  timerContainerRef: RefObject<HTMLDivElement>
  holdingReady: boolean
  startReady: boolean
}

export const TimerDisplay = ({
  timerRef,
  timerContainerRef,
  holdingReady,
  startReady,
}: TimerDisplayProps) => {
  return (
    <div
      ref={timerContainerRef}
      className="relative flex size-full grow items-center justify-center"
    >
      <p
        ref={timerRef}
        className={cn("z-10 font-mono text-5xl sm:text-7xl", {
          "text-warning": holdingReady,
          "text-success": startReady,
          "text-foreground": !holdingReady && !startReady,
        })}
      >
        00.00
      </p>
    </div>
  )
}
