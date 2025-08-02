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

  function getSelectedFiltersArray({
    selectedEmploymentKind,
    selectedSalaryFrequency,
    selectedAgencies,
    selectedTitleClassification,
    selectedCivilServiceTitle,
    selectedLevel,
    selectedPostingAge,
  }: {
    selectedEmploymentKind: string[]
    selectedSalaryFrequency: string[]
    selectedAgencies: string[]
    selectedTitleClassification: string[]
    selectedCivilServiceTitle: string[]
    selectedLevel: string[]
    selectedPostingAge: string[]
  }): string[] {
    const labels: string[] = []

    const filterOptionMap: Record<string, string> = {
      F: 'full time',
      P: 'part time',
      Annual: 'annual salary',
      Hourly: 'hourly wage',
      Daily: 'daily rate',
      'Competitive-1': 'exam required',
      'no-exam': 'no exam',
      '1w': '1 week',
      '2w': '2 weeks',
      '3w': '3 weeks',
      '1m': 'one month',
      '6m': 'six months',
    }

    selectedEmploymentKind.forEach((v) => labels.push(filterOptionMap[v] || v))
    selectedSalaryFrequency.forEach((v) => labels.push(filterOptionMap[v] || v))
    selectedTitleClassification.forEach((v) =>
      labels.push(filterOptionMap[v] || v)
    )
    selectedPostingAge.forEach((v) => labels.push(filterOptionMap[v] || v))
    selectedAgencies.forEach((v) => labels.push(v.toLowerCase()))
    selectedCivilServiceTitle.forEach((v) => labels.push(v.toLowerCase()))
    selectedLevel.forEach((v) => labels.push(`level ${v.toLowerCase()}`))

    return labels
  }

  return (
    <>
      <h1 className="p-6">nyc gov job search</h1>
      <div className="pl-6 pb-6 font-semibold">
        Filter recent NYC.gov jobs for current non-employees. Jobs renew weekly.
      </div>

      <FilterBar {...filterState} {...filterOptions} />

      <div className="flex flex-wrap  items-center gap-2 p-3 text-sm text-stone-300">
        <h2 className="font-semibold">
          {filteredJobs.length} jobs match your criteria
        </h2>

        {getSelectedFiltersArray({
          selectedEmploymentKind: filterState.selectedEmploymentKind,
          selectedSalaryFrequency: filterState.selectedSalaryFrequency,
          selectedAgencies: filterState.selectedAgencies,
          selectedTitleClassification: filterState.selectedTitleClassification,
          selectedCivilServiceTitle: filterState.selectedCivilServiceTitle,
          selectedLevel: filterState.selectedLevel,
          selectedPostingAge: filterState.selectedPostingAge,
        }).map((label, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-full bg-stone-200 text-gray-800 text-xs"
          >
            {label}
          </span>
        ))}
      </div>

      <main className="grid gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 min-h-screen bg-stone-300">
        {filteredJobs.map((job) => (
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
    </>
  )
}
