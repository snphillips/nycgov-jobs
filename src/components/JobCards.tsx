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
    <>
      {filteredJobs.map((job: NYCJobType) => (
        <JobCard
          key={`${job.job_id}-${job.posting_updated}`}
          job={job}
          onFavorite={toggleFavorite}
          isFavorited={favoriteJobs.has(job.job_id)}
        />
      ))}
    </>
  )
}
