import { useEffect, useState } from 'react'
import type { NYCJobType } from '../types'
import { fetchJobs } from '../api/fetchJobs'
import { getJobsFromDB, getCacheTimestamp, saveJobsToDB } from '../db'

/**
 * useNYCJobs
 *
 * Fetches job listings from the NYC Open Data API and returns them along
 * with loading and error states.
 *
 * To avoid hammering the API on every page load, results are cached in a
 * local IndexedDB database (via the db.ts helpers). On each load, the hook
 * checks how old the cached data is:
 *
 *   - Fresh (< 2 days old): load straight from the local DB, no network request
 *   - Stale (≥ 2 days old): fetch fresh data from the API, then update the DB
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

// How long before cached data is considered stale and re-fetched
const MAX_AGE_DAYS = 2
const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000

// Only show jobs posted in the last ~6 months
const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 183

export function useNYCJobs() {
  const [jobs, setJobs] = useState<NYCJobType[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

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
            setLoading(false)
            return
          }
        }

        // Cache miss — fetch fresh data from the API
        if (import.meta.env.DEV)
          console.log('Cache miss: fetching fresh jobs from API')
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

  return { jobs, loading, error }
}
