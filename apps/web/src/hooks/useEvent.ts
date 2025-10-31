import { useCallback, useSyncExternalStore } from "react"

import { events, type Event } from "~/lib/scramble"

const STORAGE_KEY = "speedcube:current-event"

const getStoredEvent = (): Event => {
  if (typeof window === "undefined") return "333"
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && events.includes(stored as Event)) {
    return stored as Event
  }
  return "333"
}

let currentEvent: Event = getStoredEvent()
const listeners = new Set<() => void>()

const setEventValue = (newEvent: Event) => {
  if (currentEvent === newEvent) return
  currentEvent = newEvent
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, newEvent)
  }
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return
    const newValue = event.newValue
    if (!newValue || !events.includes(newValue as Event)) return
    setEventValue(newValue as Event)
  })
}

export const useEvent = () => {
  const event = useSyncExternalStore<Event>(
    subscribe,
    () => currentEvent,
    () => "333",
  )

  const setEvent = useCallback((newEvent: Event) => {
    setEventValue(newEvent)
  }, [])

  return { event, setEvent }
}

