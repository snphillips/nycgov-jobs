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

  const handleLearnMore = (job: NYCJobType) => {
    // route or modal here
    console.log('Learn more about', job.job_id);
  };

    /* ─────────── Deduplicate rows that share the same job_id ─────────── */
  const uniqueJobs = useMemo(() => {
    const map = new Map<string, NYCJobType>();

    jobs.forEach((j) => {
      // Keep the most recently updated row for each job_id
      const existing = map.get(j.job_id);
      if (!existing) {
        map.set(j.job_id, j);
      } else {
        const a = new Date(existing.posting_updated);
        const b = new Date(j.posting_updated);
        if (b > a) map.set(j.job_id, j);
      }
    });
    return Array.from(map.values());
  }, [jobs]);


    if (loading) return <p className="p-6">Loading NYC job listings…</p>;
    if (error)   return <p className="p-6 text-red-600">Error: {error.message}</p>;

  return (
    <>
    <h1>The City of New York Jobs</h1>
    <main className="grid gap-6 p-6 sm:grid-cols-2 xl:grid-cols-3 bg-gray-50 min-h-screen">
      {uniqueJobs.map((job) => (
        <JobCard
          key={`${job.job_id}-${job.posting_updated}`}
          job={job}
          onLearnMore={handleLearnMore}
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
