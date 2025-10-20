import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import type { useScrambleHistory } from "~/hooks/useScrambleHistory"

type ScrambleHistoryResult = ReturnType<typeof useScrambleHistory>

type ScrambleDisplayProps = {
  scrambleHistory: ScrambleHistoryResult
}

export const ScrambleDisplay = ({ scrambleHistory }: ScrambleDisplayProps) => {
  const {
    currentScramble,
    isGenerating,
    canGoPrevious,
    goToPrevious,
    goToNext,
  } = scrambleHistory

  return (
    <div className="flex w-full items-center justify-center gap-4 border-b p-4 sm:p-8">
      <Button
        onClick={goToPrevious}
        disabled={!canGoPrevious}
        variant="ghost"
        size="icon-sm"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <p className="text-center font-mono text-base text-balance sm:text-lg xl:text-xl 2xl:text-2xl">
        {isGenerating ? "Generating scramble..." : currentScramble}
      </p>
      <Button
        onClick={goToNext}
        disabled={isGenerating}
        variant="ghost"
        size="icon-sm"
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  )
}
