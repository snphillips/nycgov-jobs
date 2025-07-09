import { type FC, useState } from 'react';
import JobCard from './components/JobCard';
import type { NYCJobType } from './types'
import { useNYCJobs } from './hooks/useNYCJobs';
import SelectFilter from './components/SelectFilter';


const App: FC = () => {
  const { jobs, loading, error } = useNYCJobs(); 
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [applied, setApplied]     = useState<Set<string>>(new Set());
  const [employmentFilter, setEmploymentFilter] = useState('all');

  const toggleFavorite = (job: NYCJobType) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(job.job_id)) {
        next.delete(job.job_id);
      } else {
        next.add(job.job_id);
      }
      return next;
    });
  };

  const markApplied = (job: NYCJobType) =>
    setApplied((prev) => new Set(prev).add(job.job_id));

    if (loading) return <p className="p-6">Loading NYC job listings…</p>;
    if (error)   return <p className="p-6 text-red-600">Error: {error.message}</p>;

  return (
    <>
    <h1>nyc gov jobs</h1>
    <SelectFilter
      id="employmentType"
      label="Employment Type"
      options={[
        { value: 'F', label: 'Full-Time' },
        { value: 'P', label: 'Part-Time' },
      ]}
      includeAllOption
      value={employmentFilter}
      onChange={setEmploymentFilter}
    />
    <main className="grid gap-6 p-6 sm:grid-cols-2 xl:grid-cols-4 bg-gray-50 min-h-screen">
      {jobs.map((job) => (
        <JobCard
          key={`${job.job_id}-${job.posting_updated}`}
          job={job}
          onFavorite={toggleFavorite}
          onApplied={markApplied}
          isFavorited={favorites.has(job.job_id)}
          isApplied={applied.has(job.job_id)}
        />
      ))}
    </main>
    </>
  );
};

export default App;
