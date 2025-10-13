import { createCollection } from "@tanstack/react-db"
import { dexieCollectionOptions } from "tanstack-dexie-db-collection"
import * as z from "zod"
import type { Event } from "~/lib/scramble"

export const solveSchema = z.object({
  id: z.string(),
  time: z.number().optional(),
  scramble: z.string(),
  date: z.date(),
  event: z.custom<Event>(),
  sessionId: z.string(),
})

export const sessionSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type Solve = z.infer<typeof solveSchema>
export type Session = z.infer<typeof sessionSchema>

export const solveCollection = createCollection(
  dexieCollectionOptions({
    id: "solves",
    schema: solveSchema,
    getKey: (solve) => solve.id,
  })
)

export const sessionCollection = createCollection(
  dexieCollectionOptions({
    id: "sessions",
    schema: sessionSchema,
    getKey: (session) => session.id,
  })
)
