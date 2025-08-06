import { useState, useEffect, useRef } from 'react'
import { useNYCJobs } from './hooks/useNYCJobs'
import { useJobFilters } from './hooks/useJobFilters'
import JobCard from './components/JobCard'
import { FilterBar } from './components/FilterBar'
import { FilterResultsBar } from './components/FilterResultsBar'
import type { NYCJobType } from './types'

export default function App() {
  const PAGE_SIZE = 12
  const { jobs, loading, error } = useNYCJobs()
  const { filteredJobs, filterState, filterOptions } = useJobFilters(jobs)
  const [favoriteJobs, setFavoriteJobs] = useState<Set<string>>(new Set())
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
      const next = new Set(prev)
      if (next.has(job.job_id)) {
        next.delete(job.job_id)
      } else {
        next.add(job.job_id)
      }

      return next
    })

  if (loading) return <p className="p-6">Loading NYC job listings…</p>
  if (error) return <p className="p-6 text-red-600">Error: {error.message}</p>

  return (
    <>
      <h1 className="p-6">nyc gov job search</h1>
      <div className="pl-6 pb-6 font-semibold">
        Filter recent NYC.gov jobs for current non-employees. Jobs renew weekly.
      </div>

      <FilterBar {...filterState} {...filterOptions} />
      <FilterResultsBar
        filteredJobs={filteredJobs}
        filterState={{
          selectedEmploymentKind: filterState.selectedEmploymentKind,
          selectedSalaryFrequency: filterState.selectedSalaryFrequency,
          selectedAgencies: filterState.selectedAgencies,
          selectedTitleClassification: filterState.selectedTitleClassification,
          selectedCivilServiceTitle: filterState.selectedCivilServiceTitle,
          selectedLevel: filterState.selectedLevel,
          selectedPostingAge: filterState.selectedPostingAge,
        }}
      />

      <main className="grid gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 min-h-screen bg-stone-300">
        {visibleJobs.map((job) => (
          <JobCard
            key={`${job.job_id}-${job.posting_updated}`}
            job={job}
            onFavorite={toggleFavorite}
            isFavorited={favoriteJobs.has(job.job_id)}
            // onApplied={markApplied}
            // isApplied={applied.has(job.job_id)}
          />
        ))}
      </main>
      <div ref={loaderRef} className="h-10" />
    </>
  )
}
