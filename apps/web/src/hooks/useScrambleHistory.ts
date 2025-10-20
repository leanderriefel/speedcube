import { useCallback, useEffect, useRef, useState } from "react"
import { randomScrambleForEvent } from "cubing/scramble"

import type { Event } from "~/lib/scramble"

export const useScrambleHistory = (event: Event) => {
  const [history, setHistory] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isGenerating, setIsGenerating] = useState(false)
  const isInitialized = useRef(false)

  const generateScramble = useCallback(async () => {
    setIsGenerating(true)
    try {
      const scramble = await randomScrambleForEvent(event)
      const scrambleString = scramble.toString()

      setHistory((prev) => [...prev, scrambleString])
      setCurrentIndex((prev) => prev + 1)

      return scrambleString
    } catch (error) {
      console.error("Error generating scramble:", error)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [event])

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      generateScramble()
    }
  }, [generateScramble])

  const goToNext = useCallback(async () => {
    if (currentIndex === history.length - 1) {
      await generateScramble()
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, history.length - 1))
    }
  }, [currentIndex, history.length, generateScramble])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const currentScramble = history[currentIndex]
  const canGoPrevious = currentIndex > 0
  const canGoNext = true

  return {
    currentScramble,
    isGenerating,
    canGoPrevious,
    canGoNext,
    goToPrevious,
    goToNext,
    historyLength: history.length,
    currentIndex,
  }
}
