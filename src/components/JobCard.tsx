import clsx from 'clsx';
import type { NYCJobType } from '../types'

interface JobCardProps {
  job: NYCJobType;
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

function JobCard({
  job,
  onFavorite,
  onApplied,
  isFavorited = false,
  isApplied = false,
}: JobCardProps){
  const employmentType =
    job.full_time_part_time_indicator === 'F' ? 'Full-Time' : 'Part-Time';

  const examRequired = isExamRequired(job.title_classification);
  const postedDate = new Date(job.posting_date).toLocaleDateString();
  const updatedDate = new Date(job.posting_updated).toLocaleDateString();
  const processDate = new Date(job.process_date).toLocaleDateString();

  return (
    <section className="w-full bg-white shadow-md rounded-none p-6 flex flex-col gap-6 border-b">
      {/* Header Row */}
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold leading-tight">{job.business_title}</h2>
        <p className="text-sm text-gray-500">{job.agency}</p>
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {job.job_category}
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {employmentType}
          </span>
          <span
            className={clsx(
              'px-2 py-1 rounded-full',
              examRequired
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-200 text-green-800',
            )}
          >
            {examRequired ? 'Exam Required' : 'No Exam'}
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {job.number_of_positions} Position{job.number_of_positions !== '1' && 's'}
          </span>
        </div>
      </header>

      {/* Details list */}
      <dl className="grid grid-cols-1 sm:grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm text-gray-700">
        <dt className="font-medium">Job ID</dt>
        <dd>{job.job_id}</dd>

        <dt className="font-medium">Posting Type</dt>
        <dd>{job.posting_type}</dd>

        <dt className="font-medium">Civil Service Title</dt>
        <dd>{job.civil_service_title}</dd>

        <dt className="font-medium">Title Classification</dt>
        <dd>{job.title_classification}</dd>

        <dt className="font-medium">Title Code</dt>
        <dd>{job.title_code_no}</dd>

        <dt className="font-medium">Level</dt>
        <dd>{job.level}</dd>

        <dt className="font-medium">Career Level</dt>
        <dd>{job.career_level}</dd>

        <dt className="font-medium">Salary Range</dt>
        <dd>{formatSalary(job.salary_range_from, job.salary_range_to, job.salary_frequency)}</dd>

        <dt className="font-medium">Salary Frequency</dt>
        <dd>{job.salary_frequency}</dd>

        <dt className="font-medium">Work Location</dt>
        <dd>{job.work_location}</dd>

        <dt className="font-medium">Division / Unit</dt>
        <dd>{job.division_work_unit}</dd>

        <dt className="font-medium">Hours / Shift</dt>
        <dd>{job.hours_shift}</dd>

        <dt className="font-medium">Secondary Location</dt>
        <dd>{job.work_location_1}</dd>

        <dt className="font-medium">Residency Requirement</dt>
        <dd>{job.residency_requirement}</dd>

        <dt className="font-medium">Posted</dt>
        <dd>{postedDate}</dd>
      </dl>

      {/* Job Description & Requirements */}
      <section className="space-y-3 text-sm text-gray-800">
        <div>
          <h3 className="font-medium mb-1">Job Description</h3>
          <p className="whitespace-pre-line">{job.job_description}</p>
        </div>
        {job.minimum_qual_requirements && (
          <div>
            <h3 className="font-medium mb-1">Minimum Qualifications</h3>
            <p className="whitespace-pre-line">{job.minimum_qual_requirements}</p>
          </div>
        )}
        {job.to_apply && (
          <div>
            <h3 className="font-medium mb-1">How to Apply</h3>
            <p className="whitespace-pre-line">{job.to_apply}</p>
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4">

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
    </section>
  );
};

export default JobCard;
