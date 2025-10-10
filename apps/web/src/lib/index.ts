import { cx } from "class-variance-authority"
import type { ClassValue } from "class-variance-authority/types"
import { useCallback, useEffect, useRef } from "react"
import { twMerge } from "tailwind-merge"

export const cn = (...classes: ClassValue[]) => twMerge(cx(...classes))

export const useEvent = <T extends (...args: any[]) => any>(fn: T): T => {
  const ref = useRef(fn)
  useEffect(() => {
    ref.current = fn
  })
  return useCallback((...args: Parameters<T>) => ref.current(...args), []) as T
}
