import JobCard  from '../components/JobCard'
import type { NYCJobType } from '../types'

interface FavoritesProps {
  toggleFavorite: () => void;
  markApplied: () => void;
  favoriteJobs: any;
}

export default function Favorites({
  toggleFavorite,
  markApplied,
  favoriteJobs
}:FavoritesProps ) {

  return(

    <div>
      {favoriteJobs.map((job: NYCJobType) => (
        <JobCard
          key={`${job.job_id}-${job.posting_updated}`}
          job={job}
          onFavorite={toggleFavorite}
          onApplied={markApplied}
          isFavorited={favoriteJobs.has(job.job_id)}
          isApplied={applied.has(job.job_id)}
        />
      ))}
    </div>
  );

}