import { cx } from "class-variance-authority"
import type { ClassValue } from "class-variance-authority/types"
import { twMerge } from "tailwind-merge"

export const cn = (...classes: ClassValue[]) => twMerge(cx(...classes))

export const formatTime = (totalMs: number) => {
  const roundedMs = Math.round(totalMs)
  const ms = roundedMs % 1000
  const totalSeconds = Math.floor(roundedMs / 1000)

  const centiseconds = Math.min(99, Math.floor(ms / 10))

  if (totalSeconds < 60) {
    const ss = String(totalSeconds).padStart(2, "0")
    const cs = String(centiseconds).padStart(2, "0")
    return `${ss}.${cs}`
  }

  if (totalSeconds < 3600) {
    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0")
    const ss = String(totalSeconds % 60).padStart(2, "0")
    const cs = String(centiseconds).padStart(2, "0")
    return `${mm}:${ss}.${cs}`
  }

  const hours = Math.floor(totalSeconds / 3600)
  const hh = hours >= 100 ? String(hours) : String(hours).padStart(2, "0")
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0")
  const ss = String(totalSeconds % 60).padStart(2, "0")
  const cs = String(centiseconds).padStart(2, "0")
  return `${hh}:${mm}:${ss}.${cs}`
}
