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

  const prettyLabels: Record<string, string> = {
    F: 'full time',
    P: 'part time',
    Annual: 'annual salary',
    Hourly: 'hourly wage',
    Daily: 'daily rate',
    'Competitive-1': 'exam required',
    'no-exam': 'no-exam',
    Internal: 'internal applicants',
    External: 'external applicants',
    '1w': 'one week',
    '2w': 'two weeks',
    '3w': 'three weeks',
    '1m': 'one month',
    '6m': 'six months',
    '1y': 'one year',
    older: 'more than a year',
  }

  function getSelectedFiltersSummary({
    selectedEmploymentKind,
    selectedSalaryFrequency,
    selectedAgencies,
    selectedTitleClassification,
    selectedPostingType,
    selectedCivilServiceTitle,
    selectedLevel,
    selectedPostingAge,
  }: {
    selectedEmploymentKind: string[]
    selectedSalaryFrequency: string[]
    selectedAgencies: string[]
    selectedTitleClassification: string[]
    selectedPostingType: string[]
    selectedCivilServiceTitle: string[]
    selectedLevel: string[]
    selectedPostingAge: string[]
  }) {
    const prettyLabels: Record<string, string> = {
      F: 'full time',
      P: 'part time',
      Annual: 'annual salary',
      Hourly: 'hourly wage',
      Daily: 'daily rate',
      'Competitive-1': 'exam required',
      'no-exam': 'no-exam',
      Internal: 'internal applicants',
      External: 'external applicants',
      '1w': 'one week',
      '2w': 'two weeks',
      '3w': 'three weeks',
      '1m': 'one month',
      '6m': 'six months',
      '1y': 'one year',
      older: 'more than a year',
    }

    const format = (arr: string[]) =>
      arr.map((val) => prettyLabels[val] || val).join(', ')

    const summary: string[] = []

    if (selectedEmploymentKind.length)
      summary.push(format(selectedEmploymentKind))

    if (selectedSalaryFrequency.length)
      summary.push(format(selectedSalaryFrequency))

    if (selectedAgencies.length)
      summary.push(`agencies: ${format(selectedAgencies)}`)

    if (selectedTitleClassification.length)
      summary.push(format(selectedTitleClassification))

    if (selectedPostingType.length) summary.push(format(selectedPostingType))

    if (selectedCivilServiceTitle.length)
      summary.push(`title: ${format(selectedCivilServiceTitle)}`)

    if (selectedLevel.length) summary.push(`level: ${format(selectedLevel)}`)

    if (selectedPostingAge.length)
      summary.push(`posted: ${format(selectedPostingAge)}`)

    return summary.length > 0 ? summary.join(', ') : 'No filters applied'
  }

  return (
    <>
      <h1 className="p-6">nyc gov job search</h1>
      <div className="pl-6 pb-6 font-semibold">
        Filter NYC.gov jobs. Jobs renew weekly. This site prioritizes jobs for
        current non-employees.
      </div>

      <FilterBar {...filterState} {...filterOptions} />

      <p className="text-center text-sm">
        {getSelectedFiltersSummary({
          selectedEmploymentKind: filterState.selectedEmploymentKind,
          selectedSalaryFrequency: filterState.selectedSalaryFrequency,
          selectedAgencies: filterState.selectedAgencies,
          selectedTitleClassification: filterState.selectedTitleClassification,
          selectedPostingType: filterState.selectedPostingType,
          selectedCivilServiceTitle: filterState.selectedCivilServiceTitle,
          selectedLevel: filterState.selectedLevel,
          selectedPostingAge: filterState.selectedPostingAge,
        })}
      </p>
      <h2 className="text-lg font-semibold text-center text-gray-300 p-3">
        {filteredJobs.length} jobs match your criteria
      </h2>

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
