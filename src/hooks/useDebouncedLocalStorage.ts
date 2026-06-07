import toast from 'react-hot-toast'
import { useEffect, useRef } from 'react'

/**
 * useDebouncedLocalStorage
 *
 * Saves a value to localStorage, but waits until the value stops changing
 * for `delay` milliseconds before actually writing. This is called "debouncing"
 * — it avoids hammering localStorage on every keystroke or rapid state update.
 *
 * Example: if the user clicks "favorite" 3 times quickly, we only write to
 * localStorage once, 400ms after the last click.
 *
 * @param key      - The localStorage key to write to (e.g. 'favoriteJobs')
 * @param value    - The value to save. Can be any type — arrays, objects, etc.
 * @param delay    - How long to wait (ms) after the last change before saving. Default 400ms.
 * @param serialize - How to convert the value to a string for storage. Defaults to JSON.stringify.
 */
export function useDebouncedLocalStorage<T>(
  key: string,
  value: T,
  delay = 400,
  serialize: (v: T) => string = (v) => JSON.stringify(v)
) {
  // Keep serialize in a ref so it never triggers the effect to re-run
  const serializeRef = useRef(serialize)
  useEffect(() => {
    serializeRef.current = serialize
  })

  // Only toast once if storage fails repeatedly
  const hasToastedRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, serializeRef.current(value))
      } catch (err) {
        // Quota exceeded or storage unavailable (e.g. Safari Private Mode)
        console.error(`Failed to save ${key} to localStorage`, err)
        if (!hasToastedRef.current) {
          toast.error(
            '⚠️ Could not save your changes — storage is full or unavailable'
          )
          hasToastedRef.current = true
        }
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [key, value, delay])
}
