import { type FC, useState, useMemo } from 'react';
import JobCard from './components/JobCard';
import type { NYCJobType } from './types'
import { useNYCJobs } from './hooks/useNYCJobs';


const App: FC = () => {
  const { jobs, loading, error } = useNYCJobs(); 
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [applied, setApplied]     = useState<Set<string>>(new Set());

  const toggleFavorite = (job: NYCJobType) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(job.job_id) ? next.delete(job.job_id) : next.add(job.job_id);
      return next;
    });
  };

  const markApplied = (job: NYCJobType) =>
    setApplied((prev) => new Set(prev).add(job.job_id));


    // Deduplicate rows that share the same job_id
    // I don't know why, but some jobs appear multiple times in the data
  const uniqueJobs = useMemo(() => {
    const map = new Map<string, NYCJobType>();

    jobs.forEach((job) => {
      // Keep the most recently updated row for each job_id
      const existing = map.get(job.job_id);
      if (!existing) {
        map.set(job.job_id, job);
      } else {
        const a = new Date(existing.posting_updated);
        const b = new Date(job.posting_updated);
        if (b > a) map.set(job.job_id, job);
      }
    });
    return Array.from(map.values());
  }, [jobs]);

    if (loading) return <p className="p-6">Loading NYC job listings…</p>;
    if (error)   return <p className="p-6 text-red-600">Error: {error.message}</p>;

  return (
    <>
    <h1>nyc gov jobs</h1>
    <main className="grid gap-6 p-6 sm:grid-cols-2 xl:grid-cols-3 bg-gray-50 min-h-screen">
      {uniqueJobs.map((job) => (
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
