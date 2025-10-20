import { createCollection, type CollectionConfig } from "@tanstack/react-db"
import {
  dexieCollectionOptions,
  type DexieUtils,
} from "tanstack-dexie-db-collection"
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
    startSync: true,
    dbName: "speedcube",
  }) as unknown as CollectionConfig<Solve, string, typeof solveSchema> & {
    schema: typeof solveSchema
    utils: DexieUtils
  },
)

export const sessionCollection = createCollection(
  dexieCollectionOptions({
    id: "sessions",
    schema: sessionSchema,
    getKey: (session) => session.id,
    startSync: true,
    dbName: "speedcube",
  }) as unknown as CollectionConfig<Session, string, typeof sessionSchema> & {
    schema: typeof sessionSchema
    utils: DexieUtils
  },
)
