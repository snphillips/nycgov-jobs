import { useState } from 'react'
import { useNYCJobs } from './hooks/useNYCJobs'
import { useJobFilters } from './hooks/useJobFilters'
import JobCard from './components/JobCard'
import { FilterBar } from './components/FilterBar'
import type { NYCJobType } from './types'

export default function App() {
  const { jobs, loading, error } = useNYCJobs()
  const { filteredJobs, filterState, filterOptions } = useJobFilters(jobs)
  const [favoriteJobs, setFavoriteJobs] = useState<Set<string>>(new Set())
  // const [applied, setApplied] = useState<Set<string>>(new Set())

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

  // const markApplied = (job: NYCJobType) =>
  //   setApplied((prev) => new Set(prev).add(job.job_id))

  if (loading) return <p className="p-6">Loading NYC job listings…</p>
  if (error) return <p className="p-6 text-red-600">Error: {error.message}</p>

  return (
    <>
      <h1 className="p-6">nyc gov job search</h1>
      <div className="pl-6 pb-6 font-semibold">
        Filter NYC.gov jobs. Jobs renew weekly. This site prioritizes jobs for
        non-employees.
      </div>

      <FilterBar {...filterState} {...filterOptions} />

      <h2 className="text-lg font-semibold mb-4 text-center text-gray-300 p-3">
        {filteredJobs.length} jobs match your criteria
      </h2>

      <main className="grid gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 min-h-screen bg-stone-300">
        {filteredJobs.map((job) => (
          <JobCard
            key={`${job.job_id}-${job.posting_updated}`}
            job={job}
            onFavorite={toggleFavorite}
            // onApplied={markApplied}
            isFavorited={favoriteJobs.has(job.job_id)}
            // isApplied={applied.has(job.job_id)}
          />
        ))}
      </main>
    </>
  )
}
