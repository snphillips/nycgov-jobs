import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNYCJobs } from './hooks/useNYCJobs'
import { useDebouncedLocalStorage } from './hooks/useDebouncedLocalStorage'
import { useJobFilters } from './hooks/useJobFilters'
import { JobCards } from './components/JobCards'
import { FilterBar } from './components/FilterBar'
import { FilterResultsBar } from './components/FilterResultsBar'
import type { NYCJobType } from './types'
import { HeartIcon, EyeSlashIcon } from '@heroicons/react/24/solid'
import { Toaster } from 'react-hot-toast'
import { FaGithub } from 'react-icons/fa'

const PAGE_SIZE = 12

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? new Set(arr) : new Set()
  } catch {
    return new Set()
  }
}

export default function App() {
  const { jobs, loading, error, datasetDate } = useNYCJobs()
  const { filteredJobs, filterState, filterOptions } = useJobFilters(jobs)
  const [favoriteJobs, setFavoriteJobs] = useState<Set<string>>(() =>
    loadSet('favoriteJobs')
  )
  const [hiddenJobs, setHiddenJobs] = useState<Set<string>>(() =>
    loadSet('hiddenJobs')
  )
  const [showFavoriteJobs, setShowFavoriteJobs] = useState(false)
  const [showHiddenJobs, setShowHiddenJobs] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [showBackToTop, setShowBackToTop] = useState(false)

  /* *******************************
   * Scroll to top
   * ***************************** */
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll handler
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

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

  // Debounced saves
  const favoriteJobsArray = useMemo(() => [...favoriteJobs], [favoriteJobs])
  useDebouncedLocalStorage('favoriteJobs', favoriteJobsArray)
  useDebouncedLocalStorage('hiddenJobs', [...hiddenJobs])

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
  const visibleJobs = displayJobs.slice(0, visibleCount)

  const isListExhausted = visibleCount >= displayJobs.length

  const handleShowAllJobs = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setShowFavoriteJobs(false)
    setShowHiddenJobs(false)
  }, [])

  /* *******************************
   * INFINITE SCROLL OBSERVER
   * ***************************** */
  const visibleCountRef = useRef(visibleCount)
  const displayJobsLengthRef = useRef(displayJobs.length)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    visibleCountRef.current = visibleCount
    displayJobsLengthRef.current = displayJobs.length
  }, [visibleCount, displayJobs.length])

  const loaderRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (!node) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          visibleCountRef.current < displayJobsLengthRef.current
        ) {
          setVisibleCount((prev) => prev + PAGE_SIZE)
        }
      },
      { rootMargin: '100px' }
    )

    observerRef.current.observe(node)
  }, [])

  /* *******************************
   * RENDER
   * ***************************** */
  return (
    <div id="app">
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 rounded-full bg-stone-800 text-white w-10 h-10 flex items-center justify-center shadow-lg opacity-90 hover:opacity-100 transition-opacity"
        >
          ↑
        </button>
      )}
      <Toaster position="top-center" />
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
            title={
              showFavoriteJobs ? 'Showing favorite jobs' : 'Show favorite jobs'
            }
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
            title={showHiddenJobs ? 'Showing hidden jobs' : 'Show hidden jobs'}
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
        Jobs refreshed on {datasetDate || '…'}
      </div>

      <FilterBar {...filterState} {...filterOptions} />
      <FilterResultsBar
        filteredJobs={displayJobs}
        filterState={filterState}
        showFavoriteJobs={showFavoriteJobs}
        showHiddenJobs={showHiddenJobs}
        onShowAllJobs={handleShowAllJobs}
        salaryFromOptions={filterOptions.salaryFromOptions}
      />

      <JobCards
        visibleJobs={visibleJobs}
        favoriteJobs={favoriteJobs}
        hiddenJobs={hiddenJobs}
        toggleFavorite={toggleFavorite}
        toggleHide={toggleHide}
        loading={loading}
        error={error}
      />

      {/* Infinite scroll sentinel — hidden once all jobs are loaded */}
      {!isListExhausted && <div ref={loaderRef} className="h-10" />}

      {isListExhausted && (
        <footer className="flex items-center justify-center gap-6 p-8 text-sm text-stone-400">
          <a
            href="https://sarahphillipsdev.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-200"
          >
            Made by Sarah Phillips ↗
          </a>

          <a
            href="https://github.com/snphillips"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-200"
          >
            <FaGithub className="h-6 w-6" />
          </a>
        </footer>
      )}
    </div>
  )
}
