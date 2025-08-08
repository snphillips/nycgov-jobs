import JobCard from './JobCard'
import type { NYCJobType } from '../types'

interface JobCardsProps {
  visibleJobs: NYCJobType[]
  favoriteJobs: Set<string>
  toggleFavorite: (job: NYCJobType) => void
  hiddenJobs: Set<string>
  toggleHide: (job: NYCJobType) => void
}

export function JobCards({
  visibleJobs,
  favoriteJobs,
  toggleFavorite,
  hiddenJobs,
  toggleHide,
}: JobCardsProps) {
  return (
    <main className="grid gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 min-h-screen bg-stone-300">
      {visibleJobs.map((job: NYCJobType) => (
        <JobCard
          key={`${job.job_id}-${job.posting_updated}`}
          job={job}
          toggleFavorite={toggleFavorite}
          isFavorited={favoriteJobs.has(job.job_id)}
          toggleHide={toggleHide}
          isHidden={hiddenJobs.has(job.job_id)}
        />
      ))}
    </main>
  )
}
