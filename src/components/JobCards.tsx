import JobCard from './JobCard'
import type { NYCJobType } from '../types'

interface JobCardsProps {
  filteredJobs: NYCJobType[]
  favoriteJobs: Set<string>
  isFavorited?: boolean
  toggleFavorite: () => void
}

export function JobCards({
  filteredJobs,
  favoriteJobs,
  toggleFavorite,
}: JobCardsProps) {
  return (
    <main
      className="grid gap-8 p-6 sm:grid-cols-2 md:grid-cols-3
    xl:grid-cols-4 bg-stone-400 min-h-screen"
    >
      {filteredJobs.map((job: NYCJobType) => (
        <JobCard
          key={`${job.job_id}-${job.posting_updated}`}
          job={job}
          onFavorite={toggleFavorite}
          isFavorited={favoriteJobs.has(job.job_id)}
        />
      ))}
    </main>
  )
}
