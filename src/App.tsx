import { useState, useEffect, useRef, useMemo } from 'react'
import { useNYCJobs } from './hooks/useNYCJobs'
import { useJobFilters } from './hooks/useJobFilters'
import { JobCards } from './components/JobCards'
import { FilterBar } from './components/FilterBar'
import { FilterResultsBar } from './components/FilterResultsBar'
import type { NYCJobType } from './types'
import { HeartIcon, EyeSlashIcon } from '@heroicons/react/24/solid'

export default function App() {
  const PAGE_SIZE = 12

  const { jobs, loading, error } = useNYCJobs()
  const { filteredJobs, filterState, filterOptions } = useJobFilters(jobs)

  const [favoriteJobs, setFavoriteJobs] = useState<Set<string>>(new Set())
  const [hiddenJobs, setHiddenJobs] = useState<Set<string>>(new Set())

  const [showFavoriteJobs, setShowFavoriteJobs] = useState(false)
  const [showHiddenJobs, setShowHiddenJobs] = useState(false)

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  /* *******************************
   * FAVORITE / HIDE MUTATORS
   * ***************************** */

  // Toggle a job in/out of favorites
  const toggleFavorite = (job: NYCJobType) =>
    setFavoriteJobs((previous) => {
      const next = new Set(previous)
      if (next.has(job.job_id)) {
        next.delete(job.job_id)
      } else {
        next.add(job.job_id)
      }
      return next
    })

  // Toggle a job in/out of hidden IDs
  const toggleHide = (job: NYCJobType) =>
    setHiddenJobs((previous) => {
      const next = new Set(previous)
      if (next.has(job.job_id)) {
        next.delete(job.job_id)
      } else {
        next.add(job.job_id)
      }
      return next
    })

  /* *******************************
   * DISPLAY MODE TOGGLES (UI)
   * Only one can be active at a time
   * ***************************** */

  const toggleShowFavoriteJobs = () => {
    // Flip favorites mode; ensure hidden mode is off
    setShowFavoriteJobs((prev) => !prev)
    setShowHiddenJobs(false)
  }

  const toggleShowHiddenJobs = () => {
    // Flip hidden mode; ensure favorites mode is off
    setShowHiddenJobs((prev) => !prev)
    setShowFavoriteJobs(false)
  }

  /* *******************************
   * BUILD THE DISPLAY LIST
   * - Normal: filteredJobs minus hidden
   * - Favorites: intersection of filteredJobs and favorites (hidden excluded by default)
   * - Hidden: intersection of filteredJobs and hidden
   * ***************************** */

  const displayJobs = useMemo(() => {
    if (showHiddenJobs) {
      // Only show jobs that are currently hidden
      return filteredJobs.filter((job) => hiddenJobs.has(job.job_id))
    }

    if (showFavoriteJobs) {
      // Show only favorited jobs (and NOT hidden by default)
      return filteredJobs.filter(
        (job) => favoriteJobs.has(job.job_id) && !hiddenJobs.has(job.job_id)
      )
    }

    // Default: show all filtered jobs except the hidden ones
    return filteredJobs.filter((job) => !hiddenJobs.has(job.job_id))
  }, [filteredJobs, favoriteJobs, hiddenJobs, showFavoriteJobs, showHiddenJobs])

  // Apply pagination/infinite scroll slice
  const visibleJobs = useMemo(
    () => displayJobs.slice(0, visibleCount),
    [displayJobs, visibleCount]
  )

  /* *******************************
   * RESET PAGINATION WHEN INPUTS CHANGE
   * (Filters or display mode changed → start from top)
   * ***************************** */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [
    PAGE_SIZE,
    filteredJobs, // filter criteria changed
    showFavoriteJobs, // mode changed
    showHiddenJobs, // mode changed
  ])

  /* *******************************
   * INFINITE SCROLL OBSERVER
   * ***************************** */
  useEffect(() => {
    const node = loaderRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const isInView = entries[0]?.isIntersecting
        if (isInView && visibleCount < displayJobs.length) {
          setVisibleCount((prev) => prev + PAGE_SIZE)
        }
      },
      { rootMargin: '100px' } // trigger a bit early
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [PAGE_SIZE, visibleCount, displayJobs.length])

  /* *******************************
   * LOADING / ERROR
   * ***************************** */
  if (loading) return <p className="p-6">Loading NYC job listings…</p>
  if (error) return <p className="p-6 text-red-600">Error: {error.message}</p>

  /* *******************************
   * RENDER
   * ***************************** */
  return (
    <>
      <header className="flex items-center justify-between">
        <h1 className="p-6">nyc gov job search</h1>

        {/* Right side: icons */}
        <div className="flex items-center gap-4 pr-6">
          {/* Favorited jobs toggle */}
          <button
            type="button"
            onClick={toggleShowFavoriteJobs}
            aria-pressed={showFavoriteJobs}
            aria-label="Show favorited jobs"
            className="rounded-full p-1 hover:bg-stone-100"
            title={showFavoriteJobs ? 'Showing favorites' : 'Show favorites'}
          >
            <HeartIcon
              className={`h-6 w-6 ${
                showFavoriteJobs ? 'text-red-500' : 'text-gray-300'
              }`}
            />
          </button>

          {/* Hidden jobs toggle */}
          <button
            type="button"
            onClick={toggleShowHiddenJobs}
            aria-pressed={showHiddenJobs}
            aria-label="Show hidden jobs"
            className="rounded-full p-1 hover:bg-stone-100"
            title={showHiddenJobs ? 'Showing hidden' : 'Show hidden'}
          >
            <EyeSlashIcon
              className={`h-6 w-6 ${
                showHiddenJobs ? 'text-stone-600' : 'text-gray-300'
              }`}
            />
          </button>
        </div>
      </header>

      <div className="pl-6 pb-6 font-semibold">
        Filter recent NYC.gov jobs for current non-employees. Jobs renew weekly.
      </div>

      <FilterBar {...filterState} {...filterOptions} />
      <FilterResultsBar
        filteredJobs={displayJobs}
        filterState={filterState}
        showFavoriteJobs={showFavoriteJobs}
        showHiddenJobs={showHiddenJobs}
        onShowAllJobs={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          setShowFavoriteJobs(false)
          setShowHiddenJobs(false)
        }}
      />

      <JobCards
        visibleJobs={visibleJobs}
        favoriteJobs={favoriteJobs}
        hiddenJobs={hiddenJobs}
        toggleFavorite={toggleFavorite}
        toggleHide={toggleHide}
      />

      {/* Infinite scroll */}
      <div ref={loaderRef} className="h-10" />
    </>
  )
}
