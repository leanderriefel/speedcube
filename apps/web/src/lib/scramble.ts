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

export const useScramble = (event: Event) => {
  return useQuery({
    queryFn: async () => await randomScrambleForEvent(event),
    queryKey: ["scramble", event],
  })
}
