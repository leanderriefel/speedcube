import { useState } from "react"
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { useEvent } from "~/hooks/useEvent"
import type { useScrambleHistory } from "~/hooks/useScrambleHistory"
import { events, getEventLabel, type Event } from "~/lib/scramble"

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

  const { event, setEvent } = useEvent()
  const [alignOffset, setAlignOffset] = useState(0)

  const handleEventChange = (newEvent: Event) => {
    if (newEvent !== event) {
      setEvent(newEvent)
    }
  }

  return (
    <div className="flex w-full items-center justify-center gap-4 border-b px-24 py-4 lg:py-8">
      <Button
        onClick={goToPrevious}
        disabled={!canGoPrevious}
        variant="ghost"
        size="icon-sm"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <p
            onPointerDown={(pointerEvent) => {
              if (pointerEvent.button !== 0) return
              const rect = pointerEvent.currentTarget.getBoundingClientRect()
              const offset = pointerEvent.clientX - rect.left
              const clampedOffset = Math.max(0, Math.min(offset, rect.width))
              setAlignOffset(clampedOffset)
            }}
            className="cursor-pointer rounded-md px-3 py-1 text-center font-mono text-base text-balance transition-colors select-text hover:bg-accent sm:text-lg xl:text-xl 2xl:text-2xl"
          >
            {isGenerating ? "Generating scramble..." : currentScramble}
          </p>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          alignOffset={alignOffset}
          sideOffset={4}
          className="min-w-48"
        >
          <DropdownMenuGroup>
            {events.map((eventOption) => (
              <DropdownMenuItem
                key={eventOption}
                onClick={() => handleEventChange(eventOption)}
                className="flex items-center justify-between"
              >
                <span>{getEventLabel(eventOption)}</span>
                {event === eventOption && (
                  <CheckIcon className="size-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
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

