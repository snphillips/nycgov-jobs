import JobCard from './JobCard'
import type { NYCJobType } from '../types'

import noResultsImg01 from '../assets/no-results-01.webp'
import noResultsImg02 from '../assets/no-results-02.webp'
import noResultsImg03 from '../assets/no-results-03.webp'
import noResultsImg04 from '../assets/no-results-04.webp'
import noResultsImg05 from '../assets/no-results-05.webp'

const NO_RESULTS_IMAGES = [
  {
    src: noResultsImg01,
    caption: 'Plane disaster at Sterling Place and Seventh Avenue, Brooklyn',
  },
  {
    src: noResultsImg02,
    caption: 'Department of Sanitation signs, 32nd Street shop, Brooklyn',
  },
  {
    src: noResultsImg03,
    caption: 'Litter baskets, Staten Island Borough Hall',
  },
  { src: noResultsImg04, caption: 'Bulk collection truck' },
  {
    src: noResultsImg05,
    caption: 'Flying Squad Kick-off, Ogden Avenue and 168th Street, Bronx',
  },
]

function pickRandomImage() {
  return NO_RESULTS_IMAGES[Math.floor(Math.random() * NO_RESULTS_IMAGES.length)]
}

interface JobCardsProps {
  visibleJobs: NYCJobType[]
  favoriteJobs: Set<string>
  toggleFavorite: (job: NYCJobType) => void
  hiddenJobs: Set<string>
  toggleHide: (job: NYCJobType) => void
  loading?: boolean
  error?: Error | null
}

export function JobCards({
  visibleJobs,
  favoriteJobs,
  toggleFavorite,
  hiddenJobs,
  toggleHide,
  loading,
  error,
}: JobCardsProps) {
  const isEmpty = visibleJobs.length === 0
  const { src, caption } = isEmpty
    ? pickRandomImage()
    : { src: '', caption: '' }

  return (
    <main className="grid gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 min-h-screen bg-stone-300">
      {(loading || error || isEmpty) && (
        <div className="col-span-full flex flex-col items-center">
          {loading && (
            <p className="text-stone-600 font-medium mb-2">
              Loading NYC job listings
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </p>
          )}
          {error && (
            <p className="text-red-600 font-medium mb-2">
              Error: {error.message}
            </p>
          )}
          {isEmpty && (
            <>
              <img src={src} alt="No jobs found" className="w-full block" />
              <p className="text-stone-600 font-medium text-base mt-2 text-center">
                {caption}
              </p>
            </>
          )}
        </div>
      )}
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
