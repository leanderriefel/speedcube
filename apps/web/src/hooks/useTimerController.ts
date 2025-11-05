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
import type { Event } from "~/lib/scramble"

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
  event: Event
  onSolve: (
    solve: Omit<Solve, "id" | "scramble" | "sessionId" | "date">,
  ) => void
}

export type UseTimerControllerResult = {
  timerRef: RefObject<HTMLParagraphElement>
  timerContainerRef: RefObject<HTMLDivElement>
  holdingReady: boolean
  startReady: boolean
}

export const useTimerController = ({
  event,
  onSolve,
}: UseTimerControllerOptions): UseTimerControllerResult => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const timerEl = useRef<HTMLParagraphElement>(null!)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const timerContainerRef = useRef<HTMLDivElement>(null!)
  const running = useRef(false)
  const startTime = useRef(0)
  const timerMilliseconds = useRef(0)
  const requestAnimationFrameId = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const touchStartTimeRef = useRef<number | null>(null)
  const touchStartPositionRef = useRef<{ x: number; y: number } | null>(null)

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
        event,
      })
    },
    [render, onSolve, event],
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

  const onTouchStart = useEffectEvent((e: TouchEvent) => {
    if (running.current) return

    const target = e.target as HTMLElement
    if (!timerContainerRef.current?.contains(target)) return

    if (shouldIgnoreForTimer(target)) return

    e.preventDefault()
    touchStartTimeRef.current = performance.now()
    touchStartPositionRef.current = {
      x: e.touches[0]?.clientX ?? 0,
      y: e.touches[0]?.clientY ?? 0,
    }
    clearTimer()
    setHoldingReady(true)
    timeoutRef.current = window.setTimeout(() => {
      setHoldingReady(false)
      setStartReady(true)
    }, 500)
  })

  const onTouchEnd = useEffectEvent((e: TouchEvent) => {
    if (running.current) return

    const target = e.target as HTMLElement
    if (!timerContainerRef.current?.contains(target)) return

    if (shouldIgnoreForTimer(target)) return

    if (touchStartTimeRef.current === null) return

    const touchEndTime = performance.now()
    const touchDuration = touchEndTime - touchStartTimeRef.current

    if (touchStartPositionRef.current) {
      const touchEndX = e.changedTouches[0]?.clientX ?? 0
      const touchEndY = e.changedTouches[0]?.clientY ?? 0
      const deltaX = Math.abs(touchEndX - touchStartPositionRef.current.x)
      const deltaY = Math.abs(touchEndY - touchStartPositionRef.current.y)

      if (deltaX > 10 || deltaY > 10) {
        clearTimer()
        setHoldingReady(false)
        setStartReady(false)
        touchStartTimeRef.current = null
        touchStartPositionRef.current = null
        return
      }
    }

    if (touchDuration < 50) {
      clearTimer()
      setHoldingReady(false)
      setStartReady(false)
      touchStartTimeRef.current = null
      touchStartPositionRef.current = null
      return
    }

    e.preventDefault()
    clearTimer()
    setHoldingReady(false)
    if (startReady) handleStart()
    setStartReady(false)
    touchStartTimeRef.current = null
    touchStartPositionRef.current = null
  })

  const onTouchCancel = useEffectEvent(() => {
    if (running.current) return

    clearTimer()
    setHoldingReady(false)
    setStartReady(false)
    touchStartTimeRef.current = null
    touchStartPositionRef.current = null
  })

  const onScreenTouchStop = useEffectEvent((e: TouchEvent) => {
    if (!running.current) return

    const target = e.target as HTMLElement
    if (shouldIgnoreForTimer(target)) return

    e.preventDefault()
    handleStop()
  })

  useEffect(() => {
    const ac = new AbortController()
    const opts: AddEventListenerOptions = { passive: false, signal: ac.signal }

    document.addEventListener("keydown", onKeyDown, opts)
    document.addEventListener("keyup", onKeyUp, opts)
    document.addEventListener("touchstart", onTouchStart, opts)
    document.addEventListener("touchend", onTouchEnd, opts)
    document.addEventListener("touchcancel", onTouchCancel, opts)
    document.addEventListener("touchstart", onScreenTouchStop, opts)

    return () => {
      ac.abort()
      clearTimer()
    }
  }, [clearTimer])

  return {
    timerRef: timerEl,
    timerContainerRef,
    holdingReady,
    startReady,
  }
}

