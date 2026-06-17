import { useEffect, useState } from 'react'
import type { NYCJobType } from '../types'
import { fetchJobs } from '../api/fetchJobs'
import { getJobsFromDB, getCacheTimestamp, saveJobsToDB } from '../db'

/**
 * useNYCJobs
 *
 * Fetches job listings from the NYC Open Data API and returns them along
 * with loading, error, and datasetDate states.
 *
 * Cache strategy (two-layer check):
 *   1. Time-based: if our local cache is ≥ 2 days old, skip straight to a
 *      full re-fetch — no point even asking the API for a peek.
 *   2. Dataset freshness: if the cache is still young, we do one cheap
 *      single-record API request to read the latest process_date. If it's
 *      newer than what's in our cache, the dataset has been refreshed since
 *      we last fetched, so we bust the cache and re-fetch everything.
 *      Otherwise we use the cached data as-is.
 *
 * This prevents the bug where the NYC Open Data dataset refreshes mid-week
 * but our time-based cache hasn't expired yet, causing the app to show
 * stale job listings.
 *
 * The API is paginated, so multiple requests may be made in sequence until
 * all jobs have been retrieved. Only External postings from the last 6 months
 * are kept — Internal postings are filtered out since they require existing
 * city employment.
 *
 * Junior Dev note: the `abort` flag prevents a common React bug where an
 * async function tries to update state after the component has unmounted
 * (e.g. the user navigates away mid-fetch). Always pair async useEffect
 * logic with a cleanup flag like this.
 */

// How many jobs to request per API call (API max is typically 1000–2000)
const RETRIEVAL_LIMIT = 1500

// How long before cached data is considered stale regardless of dataset freshness
const MAX_AGE_DAYS = 2
const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000

// Only show jobs posted in the last ~6 months
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

        // Layer 1: time-based cache check
        if (timestamp && now - timestamp < MAX_AGE_MS) {
          const cachedJobs = await getJobsFromDB()

          if (!abort && cachedJobs?.length) {
            // Layer 2: dataset freshness check — one cheap API call to compare
            // process_date. If the dataset hasn't changed, use the cache.
            const peek = await fetchJobs(0, 1, controller.signal)
            if (abort) return

            const apiProcessDate = peek[0]?.process_date ?? ''
            const cacheProcessDate = cachedJobs[0]?.process_date ?? ''

            if (!apiProcessDate || apiProcessDate <= cacheProcessDate) {
              if (import.meta.env.DEV)
                console.log('Cache hit: dataset unchanged, loading from DB')
              setJobs(cachedJobs)
              setDatasetDate(getDatasetDate(cachedJobs))
              setLoading(false)
              return
            }

            if (import.meta.env.DEV)
              console.log('Cache busted: dataset refreshed since last fetch')
          }
        }

        // Full re-fetch — either cache expired or dataset was refreshed
        if (import.meta.env.DEV) console.log('Fetching fresh jobs from API')
        const firstPage = await fetchJobs(0, RETRIEVAL_LIMIT, controller.signal)
        if (abort) return

        // Keep paginating until a page returns fewer results than the limit,
        // which signals we've reached the end of the dataset
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
