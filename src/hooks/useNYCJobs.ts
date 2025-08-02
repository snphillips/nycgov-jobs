import { useEffect, useState } from 'react'
import type { NYCJobType } from '../types'
import { fetchJobs } from '../api/fetchJobs'

export function useNYCJobs() {
  const [jobs, setJobs] = useState<NYCJobType[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const RETRIEVAL_LIMIT = 1000

  useEffect(() => {
    let abort = false

    ;(async () => {
      try {
        const firstPage = await fetchJobs(0, RETRIEVAL_LIMIT)
        if (abort) return

        const total = firstPage.length
        const pages = Math.ceil(total / RETRIEVAL_LIMIT)
        const allJobs = [...firstPage]

        for (let p = 1; p < pages; p++) {
          const chunk = await fetchJobs(p * RETRIEVAL_LIMIT)
          if (abort) return
          allJobs.push(...chunk)
        }

        // Filter to only external jobs within the last 6 months
        const sixMonthsAgo = Date.now() - 1000 * 60 * 60 * 24 * 183

        const filtered = allJobs.filter((job) => {
          return (
            job.posting_type === 'External' &&
            new Date(job.posting_date).getTime() >= sixMonthsAgo
          )
        })

        setJobs(filtered)
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
