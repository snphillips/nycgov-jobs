import type { FC } from 'react';
import clsx from 'clsx';
import type { NYCJobType } from '../types';


export interface JobCardProps {
  job: NYCJobType;
  onLearnMore: (job: NYCJobType) => void;
  onFavorite: (job: NYCJobType) => void;
  onApplied: (job: NYCJobType) => void;
  isFavorited?: boolean;
  isApplied?: boolean;
}

/* ───────────── Helpers ───────────── */
const isExamRequired = (classification: string) =>
  classification.startsWith('Competitive');

const formatSalary = (from: string, to: string, freq: string) => {
  const f = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
  return `${f.format(Number(from))} – ${f.format(Number(to))} ${freq}`;
};

/* ───────────── Component ───────────── */
const JobCard: FC<JobCardProps> = ({
  job,
  onLearnMore,
  onFavorite,
  onApplied,
  isFavorited = false,
  isApplied = false,
}) => {
  const employmentType =
    job.full_time_part_time_indicator === 'F' ? 'Full-Time' : 'Part-Time';

  const examRequired = isExamRequired(job.title_classification);
  const postedDate   = new Date(job.posting_date).toLocaleDateString();

  return (
    <div className="rounded-2xl shadow-md p-6 bg-white flex flex-col gap-4">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold leading-tight">
            {job.business_title}
          </h2>
          <p className="text-sm text-gray-500">{job.agency}</p>
        </div>

        <span
          className={clsx(
            'text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap',
            employmentType === 'Full-Time'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-sky-100 text-sky-800',
          )}
        >
          {employmentType}
        </span>
      </header>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {job.job_category}
        </span>
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          Level {job.level} — {job.career_level}
        </span>
        <span
          className={clsx(
            'px-2 py-1 rounded-full',
            examRequired
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-600',
          )}
        >
          {examRequired ? 'Exam Required' : 'No Exam'}
        </span>
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {job.number_of_positions} Position
          {job.number_of_positions !== '1' && 's'}
        </span>
      </div>

      {/* Meta */}
      <div className="text-sm text-gray-700 space-y-1">
        <p>
          <strong>Salary:</strong>{' '}
          {formatSalary(job.salary_range_from, job.salary_range_to, job.salary_frequency)}
        </p>
        <p>
          <strong>Location:</strong> {job.work_location}
        </p>
        <p>
          <strong>Division:</strong> {job.division_work_unit}
        </p>
        <p>
          <strong>Posted:</strong> {postedDate}
        </p>
      </div>

      {/* Snippet */}
      <p className="text-sm text-gray-600 line-clamp-3">
        <strong>Job Description:</strong> {job.job_description}
      </p>

      {/* Actions */}
      <div className="mt-auto flex flex-wrap gap-3">
        <button
          onClick={() => onLearnMore(job)}
          className="flex-1 rounded-lg bg-blue-600 text-white text-sm font-medium px-4 py-2 hover:bg-blue-700"
        >
          Learn More
        </button>

        <button
          onClick={() => onFavorite(job)}
          className={clsx(
            'text-sm font-medium rounded-lg px-4 py-2 border',
            isFavorited
              ? 'bg-red-100 text-red-600 border-red-200'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
          )}
        >
          {isFavorited ? 'Favorited' : 'Favorite'}
        </button>

        <button
          onClick={() => onApplied(job)}
          disabled={isApplied}
          className={clsx(
            'text-sm font-medium rounded-lg px-4 py-2',
            isApplied
              ? 'bg-green-100 text-green-600 cursor-default'
              : 'bg-green-600 text-white hover:bg-green-700',
          )}
        >
          {isApplied ? 'Applied' : 'Apply'}
        </button>
      </div>
    </div>
  );
};

export default JobCard;
