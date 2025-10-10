import { createFileRoute } from "@tanstack/react-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn, useEvent } from "~/lib"
import { useScramble } from "~/lib/scramble"

const HomeRoute = () => {
  const timerEl = useRef<HTMLParagraphElement>(null!)
  const running = useRef(false)
  const startTime = useRef(0)
  const timerMilliseconds = useRef(0)
  const requestAnimationFrameId = useRef<number | null>(null)

  const scramble = useScramble("333")

  const formatTime = (totalMs: number) => {
    const wholeMs = Math.floor(totalMs)
    const ms = wholeMs % 1000
    const totalSeconds = Math.floor(wholeMs / 1000)

    const roundedMs = Math.round(ms / 10) * 10

    if (totalSeconds < 60) {
      // ss.mm
      const ss = String(totalSeconds).padStart(2, "0")
      const mm = String(Math.floor(roundedMs / 10)).padStart(2, "0")
      return `${ss}.${mm}`
    } else if (totalSeconds < 3600) {
      // mm:ss.mm
      const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0")
      const ss = String(totalSeconds % 60).padStart(2, "0")
      const mmMs = String(Math.floor(roundedMs / 10)).padStart(2, "0")
      return `${mm}:${ss}.${mmMs}`
    } else {
      // hh:mm:ss.mm
      const hours = Math.floor(totalSeconds / 3600)
      const hh = hours >= 100 ? String(hours) : String(hours).padStart(2, "0")
      const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0")
      const ss = String(totalSeconds % 60).padStart(2, "0")
      const mmMs = String(Math.floor(roundedMs / 10)).padStart(2, "0")
      return `${hh}:${mm}:${ss}.${mmMs}`
    }
  }

  const render = () => {
    const elapsed =
      timerMilliseconds.current +
      (running.current ? performance.now() - startTime.current : 0)
    timerEl.current.textContent = formatTime(elapsed)
    if (running.current)
      requestAnimationFrameId.current = requestAnimationFrame(render)
  }

  const handleStart = () => {
    if (running.current) return
    running.current = true
    timerMilliseconds.current = 0
    startTime.current = performance.now()
    requestAnimationFrameId.current = requestAnimationFrame(render)
  }

  const handleStop = (_dnf: boolean = false) => {
    if (!running.current) return
    timerMilliseconds.current += performance.now() - startTime.current
    running.current = false
    if (requestAnimationFrameId.current !== null)
      cancelAnimationFrame(requestAnimationFrameId.current)
    requestAnimationFrameId.current = null
    render()
  }

  const [startReady, setStartReady] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const onKeyDown = useEvent((e: KeyboardEvent) => {
    if (running.current) {
      if (e.key === "Escape") handleStop(true)
      else handleStop()
      return
    }

    if (e.code === "Space" && !e.repeat) {
      e.preventDefault()
      clearTimer()
      timeoutRef.current = window.setTimeout(() => {
        setStartReady(true)
      }, 500)
    }
  })

  const onKeyUp = useEvent((e: KeyboardEvent) => {
    if (e.code === "Space") {
      clearTimer()
      if (startReady) handleStart()
      setStartReady(false)
    }
  })

  useEffect(() => {
    const ac = new AbortController()
    const opts: AddEventListenerOptions = { passive: false, signal: ac.signal }

    document.addEventListener("keydown", onKeyDown, opts)
    document.addEventListener("keyup", onKeyUp, opts)

    return () => {
      ac.abort()
      clearTimer()
    }
  }, [onKeyDown, onKeyUp, clearTimer])

  return (
    <main className="relative min-h-screen overflow-hidden bg-background flex flex-col items-center justify-center">
      <p className="text-md sm:text-3xl font-mono absolute top-8 mx-auto px-2 sm:px-10 text-center">
        {scramble.data?.toString() ?? "Generating scramble..."}
      </p>
      <p
        ref={timerEl}
        className={cn("text-5xl sm:text-7xl font-mono", {
          "text-warning": startReady,
          "text-foreground": !startReady,
        })}
      >
        00.00
      </p>
    </main>
  )
}

export const Route = createFileRoute("/")({
  component: HomeRoute,
})
