import { useQuery } from "@tanstack/react-query"
import { randomScrambleForEvent } from "cubing/scramble"

export const events = [
  "333",
  "333bf",
  "333fm",
  "222",
  "444",
  "777",
  "sq1",
  "minx",
  "clock",
  "fto",
  "master_tetraminx",
] as const

export type Event = (typeof events)[number]

export const eventLabels: Record<Event, string> = {
  "333": "3x3",
  "333bf": "3x3 Blindfolded",
  "333fm": "3x3 Fewest Moves",
  "222": "2x2",
  "444": "4x4",
  "777": "7x7",
  "sq1": "Square-1",
  "minx": "Megaminx",
  "clock": "Clock",
  "fto": "Face-Turning Octahedron",
  "master_tetraminx": "Master Tetraminx",
}

export const getEventLabel = (event: Event): string => {
  return eventLabels[event] ?? event
}

export const useScramble = (event: Event) => {
  return useQuery({
    queryFn: async () => await randomScrambleForEvent(event),
    queryKey: ["scramble", event],
  })
}
