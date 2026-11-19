import { useSyncExternalStore } from 'react'

let enabled = false
const listeners = new Set<() => void>()

export function isEditMode() {
  return enabled
}

export function setEditMode(v: boolean) {
  enabled = v
  listeners.forEach((f) => f())
}

export function useEditMode() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
    () => enabled,
  )
}
