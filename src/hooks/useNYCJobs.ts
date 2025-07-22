import { useEffect, useState } from 'react'
import type { NYCJobType } from '../types'
import { fetchJobs } from '../api/fetchJobs'

export function useNYCJobs() {
  const [jobs, setJobs] = useState<NYCJobType[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  // while in dev we're only grabbing a smaller number of jobs
  const RETRIEVAL_LIMIT = 200

  useEffect(() => {
    let abort = false

    ;(async () => {
      try {
        const firstPage = await fetchJobs(0, RETRIEVAL_LIMIT)
        if (abort) return

        // If there are more than 1000, pull additional pages
        const total = firstPage.length
        const pages = Math.ceil(total / RETRIEVAL_LIMIT)
        const allJobs = [...firstPage]

        for (let p = 1; p < pages; p++) {
          const chunk = await fetchJobs(p * RETRIEVAL_LIMIT)
          if (abort) return
          allJobs.push(...chunk)
        }

        setJobs(allJobs)
      } catch (error) {
        if (!abort) setError(error as Error)
      } finally {
        if (!abort) setLoading(false)
      }
    })()

    return () => {
      abort = true
    }
  }, [])

  return { jobs, loading, error }
}
