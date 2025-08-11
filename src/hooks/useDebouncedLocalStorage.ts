import toast from 'react-hot-toast'
import { useEffect } from 'react'

export function useDebouncedLocalStorage<T>(
  key: string,
  value: T,
  delay = 400,
  serialize: (v: T) => string = (v) => JSON.stringify(v)
) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(key, serialize(value))
      } catch (err) {
        // Quota exceeded or storage unavailable (e.g., Safari Private Mode)
        console.error(`Failed to save ${key} to localStorage`, err)
        toast.error(
          '⚠️ Could not save your changes — storage is full or unavailable'
        )
      }
    }, delay)

    return () => window.clearTimeout(timer)
  }, [key, value, delay, serialize])
}
