import { useState, useEffect, useRef } from 'react'
import { useNYCJobs } from './hooks/useNYCJobs'
import { useJobFilters } from './hooks/useJobFilters'
import { JobCards } from './components/JobCards'
import { FilterBar } from './components/FilterBar'
import { FilterResultsBar } from './components/FilterResultsBar'
import type { NYCJobType } from './types'
import { HeartIcon } from '@heroicons/react/24/solid'
import { EyeSlashIcon } from '@heroicons/react/24/solid'

export default function App() {
  const PAGE_SIZE = 12
  const { jobs, loading, error } = useNYCJobs()
  const { filteredJobs, filterState, filterOptions } = useJobFilters(jobs)
  const [favoriteJobs, setFavoriteJobs] = useState<Set<string>>(new Set())
  const [hiddenJobs, setHiddenJobs] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  // const [applied, setApplied] = useState<Set<string>>(new Set())

  // Only displaying x jobs at a time to help with performance
  const visibleJobs = filteredJobs.slice(0, visibleCount)

  // const markApplied = (job: NYCJobType) =>
  //   setApplied((prev) => new Set(prev).add(job.job_id))

  const loaderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = loaderRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredJobs.length) {
          setVisibleCount((prev) => prev + PAGE_SIZE)
        }
      },
      { rootMargin: '100px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [visibleCount, filteredJobs.length])

  const toggleFavorite = (job: NYCJobType) =>
    setFavoriteJobs((prev) => {
      const nextState = new Set(prev)
      if (nextState.has(job.job_id)) {
        nextState.delete(job.job_id)
      } else {
        nextState.add(job.job_id)
      }
      return nextState
    })

  const toggleHide = (job: NYCJobType) =>
    setHiddenJobs((prev) => {
      console.log('toggle hide', job.job_id)
      const nextState = new Set(prev)
      if (nextState.has(job.job_id)) {
        nextState.delete(job.job_id)
      } else {
        nextState.add(job.job_id)
      }
      return nextState
    })

  if (loading) return <p className="p-6">Loading NYC job listings…</p>
  if (error) return <p className="p-6 text-red-600">Error: {error.message}</p>

  return (
    <>
      <header className="flex items-center justify-between">
        <h1 className="p-6">nyc gov job search</h1>
        {/* Right side: icons */}
        <div className="flex items-center gap-4">
          {/* Favorited jobs */}
          <HeartIcon
            aria-label="Favorited jobs"
            className="h-6 w-6 text-gray-200 cursor-pointer hover:text-red-400"
          />

          {/* Hidden jobs */}
          <EyeSlashIcon
            aria-label="Hidden jobs"
            className="h-6 w-6 mr-6 text-gray-200 cursor-pointer hover:text-gray-400"
          />
        </div>
      </header>

      <div className="pl-6 pb-6 font-semibold">
        Filter recent NYC.gov jobs for current non-employees. Jobs renew weekly.
      </div>

      <FilterBar {...filterState} {...filterOptions} />
      <FilterResultsBar filteredJobs={filteredJobs} filterState={filterState} />

      <JobCards
        visibleJobs={visibleJobs}
        favoriteJobs={favoriteJobs}
        toggleFavorite={toggleFavorite}
        hiddenJobs={hiddenJobs}
        toggleHide={toggleHide}
      />
      <div ref={loaderRef} className="h-10" />
    </>
  )
}
