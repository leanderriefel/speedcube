"use client"

import { lazy, Suspense, useEffect, useState, type RefObject } from "react"
import { motion } from "motion/react"

import { cn } from "~/lib"

const Background = lazy(() => import("~/components/background"))

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
  const BackgroundFade = () => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
      const id = requestAnimationFrame(() => setIsVisible(true))
      return () => cancelAnimationFrame(id)
    }, [])

    return (
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: isVisible ? 0.075 : 0 }}
        transition={{ duration: 5, ease: "easeInOut" }}
      >
        <Background
          speed={2.5}
          scale={1}
          color="#7F7F7F"
          noiseIntensity={5}
          rotation={0}
        />
      </motion.div>
    )
  }

  return (
    <div className="relative flex size-full grow items-center justify-center">
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
      <Suspense fallback={null}>
        <BackgroundFade />
      </Suspense>
    </div>
  )
}
