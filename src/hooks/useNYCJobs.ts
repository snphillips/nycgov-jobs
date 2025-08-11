import { useEffect, useState } from 'react'
import type { NYCJobType } from '../types'
import { fetchJobs } from '../api/fetchJobs'
import { getJobsFromDB, getCacheTimestamp, saveJobsToDB } from '../db'

const RETRIEVAL_LIMIT = 1500
const MAX_AGE_DAYS = 2
const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000
const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 183

export function useNYCJobs() {
  const [jobs, setJobs] = useState<NYCJobType[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let abort = false

    const loadJobs = async () => {
      try {
        const timestamp = await getCacheTimestamp()
        const now = Date.now()

        if (timestamp && now - timestamp < MAX_AGE_MS) {
          const cachedJobs = await getJobsFromDB()
          console.log('Data is young. Get cachedJobs data from DB')
          if (!abort && cachedJobs) {
            setJobs(cachedJobs)
            setLoading(false)
            return
          }
        }

        // 🟡 Otherwise, fetch from API
        console.log('Data is old. Fetching fresh data.')
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

        // ✅ Filter: show only external jobs + jobs from the last 6 months
        const sixMonthsAgo = Date.now() - SIX_MONTHS_MS
        const filtered = allJobs.filter((job) => {
          return (
            job.posting_type === 'External' &&
            new Date(job.posting_date).getTime() >= sixMonthsAgo
          )
        })

        if (!abort) {
          setJobs(filtered)
          setLoading(false)
          await saveJobsToDB(filtered)
        }
      } catch (error) {
        if (!abort) setError(error as Error)
      } finally {
        if (!abort) setLoading(false)
      }
    }

    loadJobs()

    return () => {
      abort = true
    }
  }, [])

  return { jobs, loading, error }
}
