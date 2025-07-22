import JobCard from '../components/JobCard'
import type { NYCJobType } from '../types'

interface FavoritesProps {
  toggleFavorite: () => void
  favoriteJobs: any
}

export default function Favorites({
  toggleFavorite,
  favoriteJobs,
}: FavoritesProps) {
  return (
    <div>
      {favoriteJobs.map((job: NYCJobType) => (
        <JobCard
          key={`${job.job_id}-${job.posting_updated}`}
          job={job}
          onFavorite={toggleFavorite}
          isFavorited={favoriteJobs.has(job.job_id)}
        />
      ))}
    </div>
  )
}
