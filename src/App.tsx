import { useState, useMemo } from 'react';
import JobCard from './components/JobCard';
import type { NYCJobType } from './types'
import { useNYCJobs } from './hooks/useNYCJobs';
import { FilterBar } from './components/FilterBar';


export function App() {
  const { jobs, loading, error } = useNYCJobs(); 
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [applied, setApplied]     = useState<Set<string>>(new Set());

  /* ─────────── Filters ─────────── */
  const [employmentKindFilter, setEmploymentKindFilter] = useState('all'); // 'F' | 'P' | 'all'
  const [salaryFrequencyFilter, setSalaryFrequencyFilter] = useState('all'); // 'Annual' | 'Hourly' | 'all'
  // const [agencyFilter, setAgencyFilter] = useState('all');
  // const [titleClassFilter, setTitleClassFilter] = useState('all');
  

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

    /* ─────────── Apply filters ─────────── */
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (employmentKindFilter !== 'all' && j.full_time_part_time_indicator !== employmentKindFilter) return false;
      if (salaryFrequencyFilter !== 'all' && j.salary_frequency !== salaryFrequencyFilter) return false;
      // if (agencyFilter !== 'all' && j.agency !== agencyFilter) return false;
      // if (titleClassFilter !== 'all' && j.title_classification !== titleClassFilter) return false;
      return true;
    });
  }, [jobs, employmentKindFilter, salaryFrequencyFilter]);



    if (loading) return <p className="p-6">Loading NYC job listings…</p>;
    if (error)   return <p className="p-6 text-red-600">Error: {error.message}</p>;

  return (
    <>
    <h1>nyc gov jobs</h1>
    <FilterBar
      employmentKindFilter={employmentKindFilter}
      setEmploymentKindFilter={setEmploymentKindFilter}
      salaryFrequencyFilter={salaryFrequencyFilter}
      setSalaryFrequencyFilter={setSalaryFrequencyFilter}
      // agency={agencyFilter} 
      // titleClassification={titleClassFilter}
      // employmentOptions={employmentOptions}
      // salaryOptions={salaryOptions}
      // agencyOptions={agencyOptions}
      // titleClassOptions={titleClassOptions}
      // onEmploymentChange={setEmploymentFilter}
      // onAgencyChange={setAgencyFilter}
      // onTitleClassChange={setTitleClassFilter}
    />

    <main className="grid gap-6 p-6 sm:grid-cols-2 xl:grid-cols-4 bg-gray-50 min-h-screen">
      {filteredJobs.map((job) => (
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
