import clsx from 'clsx'
import type { NYCJobType } from '../types'
import { cleanText, formatSalaryRangeFrequency } from '../utils.ts'
import { HeartIcon, EyeSlashIcon } from '@heroicons/react/24/solid'

/**
 * JobCard
 *
 * Displays a single NYC job listing as a card. Shows key metadata (salary,
 * location, exam requirement, etc.) along with the full job description and
 * qualifications.
 *
 * The card has two action buttons — favorite and hide — which are controlled
 * by the parent component via toggleFavorite and toggleHide callbacks.
 *
 * Junior Dev note: this component is "controlled" — it doesn't manage its own
 * favorite/hidden state. The parent (App.tsx) owns that state and passes it
 * down as props. This makes it easier to persist and share state across cards.
 */

interface JobCardProps {
  job: NYCJobType
  toggleFavorite: (job: NYCJobType) => void
  toggleHide: (job: NYCJobType) => void
  isFavorited?: boolean
  isHidden?: boolean
}

// Classifications starting with 'Competitive' require a civil service exam
const isExamRequired = (classification: string) =>
  classification.startsWith('Competitive')

function JobCard({
  job,
  toggleFavorite,
  toggleHide,
  isFavorited = false,
  isHidden = false,
}: JobCardProps) {
  // 'F' and 'P' are the raw values from the NYC API — map them to readable labels
  const employmentType =
    job.full_time_part_time_indicator === 'F' ? 'Full-Time' : 'Part-Time'

  const examRequired = isExamRequired(job.title_classification)
  const postedDate = new Date(job.posting_date).toLocaleDateString()

  // Extract handlers so onClick props don't create new functions on every render
  const handleFavorite = () => toggleFavorite(job)
  const handleHide = () => toggleHide(job)

  return (
    <section className="w-full bg-stone-100 shadow-md rounded-lg p-4 flex flex-col gap-6 border-b h-100 overflow-auto">
      <header className="card-header flex flex-col gap-1">
        <div className="title-icons-row flex flex-row justify-between">
          <h3 className="font-semibold leading-tight text-amber-950">
            {job.business_title}
          </h3>
          <div>
            <button
              className="favorite-button bg-transparent! text-gray-400 hover:text-red-800 focus:outline-none p-2! rounded-full shadow-indigo-500/50"
              onClick={handleFavorite}
              aria-label={isFavorited ? 'Unfavorite job' : 'Favorite job'}
            >
              {/* clsx applies text-red-600 only when isFavorited is true */}
              <HeartIcon
                className={clsx('h-6 w-6', isFavorited && 'text-red-600')}
              />
            </button>
            <button
              className="hide-button bg-transparent! text-gray-400 hover:text-gray-800 focus:outline-none p-2! rounded-full shadow-indigo-500/50"
              onClick={handleHide}
              aria-label={isHidden ? 'Unhide job' : 'Hide job'}
            >
              <EyeSlashIcon
                className={clsx('h-6 w-6', isHidden && 'text-gray-600')}
              />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500">{job.agency}</p>
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {job.job_category}
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {employmentType}
          </span>
          {/* Exam badge changes color depending on whether an exam is required */}
          <span
            className={clsx(
              'px-2 py-1 rounded-full',
              examRequired
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-200 text-green-800'
            )}
          >
            {examRequired ? 'Exam Required' : 'No Exam'}
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {job.number_of_positions} Position
            {job.number_of_positions !== '1' && 's'}
          </span>
        </div>
      </header>

      {/* dl = description list — semantic HTML for key/value pairs like a metadata table.
          The CSS grid makes the <dt> labels and <dd> values line up in two columns. */}
      <dl className="grid grid-cols-1 sm:grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm text-gray-700">
        <dt className="font-medium">Date Posted</dt>
        <dd>{postedDate}</dd>
        <dt className="font-medium">Salary Range</dt>
        <dd>
          {formatSalaryRangeFrequency(
            job.salary_range_from,
            job.salary_range_to,
            job.salary_frequency
          )}
        </dd>
        <dt className="font-medium">Posting Type</dt>
        <dd>{job.posting_type}</dd>
        <dt className="font-medium">Work Location</dt>
        <dd>{job.work_location}</dd>
        <dt className="font-medium">Career Level</dt>
        <dd>{job.career_level}</dd>
        <dt className="font-medium">Civil Service Title</dt>
        <dd>{job.civil_service_title}</dd>
        <dt className="font-medium">Title Classification</dt>
        <dd>{job.title_classification}</dd>
        <dt className="font-medium">Title Code</dt>
        <dd>{job.title_code_no}</dd>
        <dt className="font-medium">Level</dt>
        <dd>{job.level}</dd>
        <dt className="font-medium">Salary Frequency</dt>
        <dd>{job.salary_frequency}</dd>
        <dt className="font-medium">Division / Unit</dt>
        <dd>{job.division_work_unit}</dd>

        {/* Fragments let us return paired <dt>/<dd> siblings conditionally
            without a wrapper div, which would break the dl grid layout */}
        {job.hours_shift && (
          <>
            <dt className="font-medium">Hours / Shift</dt>
            <dd>{job.hours_shift}</dd>
          </>
        )}
        {job.work_location_1 && (
          <>
            <dt className="font-medium">Secondary Location</dt>
            <dd>{job.work_location_1}</dd>
          </>
        )}
      </dl>

      <section className="space-y-3 text-sm text-gray-800">
        {/* whitespace-pre-line preserves line breaks in the raw API text
            without rendering the full whitespace of <pre> */}
        <div>
          <h5 className="font-medium mb-1">Residency Requirement</h5>
          <p className="whitespace-pre-line">
            {cleanText(job.residency_requirement)}
          </p>
        </div>
        <div>
          <h5 className="font-medium mb-1">Job Description</h5>
          <p className="whitespace-pre-line">
            {cleanText(job.job_description)}
          </p>
        </div>
        {job.minimum_qual_requirements && (
          <div>
            <h5 className="font-medium mb-1">Minimum Qualifications</h5>
            <p className="whitespace-pre-line">
              {cleanText(job.minimum_qual_requirements)}
            </p>
          </div>
        )}
        <div>
          <a
            href={`https://cityjobs.nyc.gov/jobs?q=${job.job_id}&options=&page=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-block text-sm font-medium text-amber-950 underline hover:text-amber-700"
          >
            View job on NYC.gov website ↗
          </a>
        </div>
        {/* )} */}
      </section>
    </section>
  )
}

export default JobCard
