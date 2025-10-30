import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type RefObject,
} from "react"

import { formatTime } from "~/lib"
import type { Solve } from "~/lib/db"

const shouldIgnoreForTimer = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false

  if (target.dataset.timerIgnore !== undefined) return true
  if (target.closest("[data-timer-ignore]")) return true

  if (target.isContentEditable || target.closest("[contenteditable]") !== null)
    return true

  // Check if any dropdown menu is open
  if (
    document.querySelector(
      "[data-slot='dropdown-menu-content'][data-state='open']",
    ) !== null
  )
    return true

  // Check if any dialog is open
  if (
    document.querySelector(
      "[data-slot='dialog-content'][data-state='open']",
    ) !== null
  )
    return true

  // Only handle timer if focus is on body/document (not on any specific element)
  const activeElement = document.activeElement
  if (
    activeElement &&
    activeElement !== document.body &&
    activeElement !== document.documentElement
  ) {
    return true
  }

  return false
}

type UseTimerControllerOptions = {
  onSolve: (
    solve: Omit<Solve, "id" | "scramble" | "sessionId" | "date">,
  ) => void
}

export type UseTimerControllerResult = {
  timerRef: RefObject<HTMLParagraphElement>
  holdingReady: boolean
  startReady: boolean
}

export const useTimerController = ({
  onSolve,
}: UseTimerControllerOptions): UseTimerControllerResult => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const timerEl = useRef<HTMLParagraphElement>(null!)
  const running = useRef(false)
  const startTime = useRef(0)
  const timerMilliseconds = useRef(0)
  const requestAnimationFrameId = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const [holdingReady, setHoldingReady] = useState(false)
  const [startReady, setStartReady] = useState(false)

  const render = useCallback(function render() {
    const elapsed =
      timerMilliseconds.current +
      (running.current ? performance.now() - startTime.current : 0)
    timerEl.current.textContent = formatTime(elapsed)
    if (running.current)
      requestAnimationFrameId.current = requestAnimationFrame(render)
  }, [])

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleStart = useCallback(() => {
    if (running.current) return
    running.current = true
    timerMilliseconds.current = 0
    startTime.current = performance.now()
    requestAnimationFrameId.current = requestAnimationFrame(render)
  }, [render])

  const handleStop = useCallback(
    (dnf: boolean = false) => {
      if (!running.current) return
      timerMilliseconds.current += performance.now() - startTime.current
      running.current = false
      if (requestAnimationFrameId.current !== null)
        cancelAnimationFrame(requestAnimationFrameId.current)
      requestAnimationFrameId.current = null
      render()
      onSolve({
        time: dnf ? undefined : timerMilliseconds.current,
        event: "333",
      })
    },
    [render, onSolve],
  )

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (shouldIgnoreForTimer(e.target)) return

    if (running.current) {
      if (e.key === "Escape") handleStop(true)
      else handleStop()
      return
    }

    if (e.code === "Space" && !e.repeat) {
      e.preventDefault()
      clearTimer()
      setHoldingReady(true)
      timeoutRef.current = window.setTimeout(() => {
        setHoldingReady(false)
        setStartReady(true)
      }, 500)
    }
  })

  const onKeyUp = useEffectEvent((e: KeyboardEvent) => {
    if (shouldIgnoreForTimer(e.target)) return

    if (e.code === "Space") {
      clearTimer()
      setHoldingReady(false)
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
  }, [clearTimer])

  return {
    timerRef: timerEl,
    holdingReady,
    startReady,
  }
}
