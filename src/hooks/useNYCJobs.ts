import { useEffect, useState } from 'react'
import type { NYCJobType } from '../types'
import { fetchJobs } from '../api/fetchJobs'
import { getJobsFromDB, getCacheTimestamp, saveJobsToDB } from '../db'

const RETRIEVAL_LIMIT = 1500
const MAX_AGE_DAYS = 2
const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000
const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 183

/**
 * Returns the latest process_date across all jobs as a formatted string
 * like "June 15, 2026". This is when NYC Open Data last refreshed the
 * dataset (weekly cadence) — not when this app fetched it.
 */
function getDatasetDate(jobs: NYCJobType[]): string {
  let max = 0
  for (const job of jobs) {
    const t = job.process_date ? new Date(job.process_date).getTime() : 0
    if (t > max) max = t
  }
  return max > 0
    ? new Date(max).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''
}

export function useNYCJobs() {
  const [jobs, setJobs] = useState<NYCJobType[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const [datasetDate, setDatasetDate] = useState('')

  useEffect(() => {
    let abort = false
    const controller = new AbortController()

    const loadJobs = async () => {
      try {
        const timestamp = await getCacheTimestamp()
        const now = Date.now()

        // Cache hit — data is fresh enough, load from local DB
        if (timestamp && now - timestamp < MAX_AGE_MS) {
          const cachedJobs = await getJobsFromDB()
          if (import.meta.env.DEV)
            console.log('Cache hit: loading jobs from DB')
          if (!abort && cachedJobs) {
            setJobs(cachedJobs)
            setDatasetDate(getDatasetDate(cachedJobs))
            setLoading(false)
            return
          }
        }

        // Cache miss — fetch fresh data from the API
        if (import.meta.env.DEV)
          console.log('Cache miss: fetching fresh jobs from API')
        const firstPage = await fetchJobs(0, RETRIEVAL_LIMIT, controller.signal)
        if (abort) return

        const allJobs = [...firstPage]
        if (firstPage.length === RETRIEVAL_LIMIT) {
          let offset = RETRIEVAL_LIMIT
          while (true) {
            const chunk = await fetchJobs(
              offset,
              RETRIEVAL_LIMIT,
              controller.signal
            )
            if (abort) return
            allJobs.push(...chunk)
            if (chunk.length < RETRIEVAL_LIMIT) break
            offset += RETRIEVAL_LIMIT
          }
        }

        // Filter to only External postings from the last 6 months
        const sixMonthsAgo = Date.now() - SIX_MONTHS_MS
        const filtered = allJobs.filter(
          (job) =>
            job.posting_type === 'External' &&
            new Date(job.posting_date).getTime() >= sixMonthsAgo
        )

        if (!abort) {
          setJobs(filtered)
          setDatasetDate(getDatasetDate(filtered))
          setLoading(false)
          await saveJobsToDB(filtered)
        }
      } catch (err) {
        if (!abort) {
          setError(err as Error)
          setLoading(false)
        }
      }
    }

    loadJobs()

    return () => {
      abort = true
      controller.abort()
    }
  }, [])

  return { jobs, loading, error, datasetDate }
}
