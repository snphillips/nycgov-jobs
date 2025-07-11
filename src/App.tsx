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
  const [selectedEmploymentKind, setSelectedEmploymentKind] = useState<string[]>([]);
  const [selectedSalaryFrequency, setSelectedSalaryFrequency] = useState<string[]>([]);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [selectedTitleClassification, setSelectedTitleClassification] = useState<string[]>([]);
  

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

  // Deduplicate rows by job_id 
  // I don't know why, but the data contains duplicate jobs
  const uniqueJobs = useMemo(() => {
    const map = new Map<string, NYCJobType>();
    let duplicateCount = 0;

    jobs.forEach((job) => {
      const existing = map.get(job.job_id);

      if (!existing) {
        map.set(job.job_id, job);
      } else {
        // Check if this job is more recent than the existing one
        const isNewer = new Date(job.posting_updated) > new Date(existing.posting_updated);
        if (isNewer) {
          map.set(job.job_id, job);
        }
        duplicateCount++;
      }
    });

  console.log(`🧹 Removed ${duplicateCount} duplicate job postings.`);
  return Array.from(map.values());
}, [jobs]);

  const filteredJobs = useMemo(() => {
    const NON_EXAM_CLASSES = [
      'Pending Classification-2',
      'Labor-3',
      'Exempt-4',
      'Non-Competitive-5',
    ];

    return uniqueJobs.filter((job) => {
      if (
        selectedEmploymentKind.length > 0 &&
        !selectedEmploymentKind.includes(job.full_time_part_time_indicator)
      ) return false;

      if (
        selectedSalaryFrequency.length > 0 &&
        !selectedSalaryFrequency.includes(job.salary_frequency)
      ) return false;

      if (
        selectedAgencies.length > 0 &&
        !selectedAgencies.includes(job.agency)
      ) return false;

      if (
        selectedTitleClassification.length > 0 &&
        !(
          // either it's a match for the classification 'Competitive-1'
          selectedTitleClassification.includes(job.title_classification) ||
          // OR the user selected "no-exam", and job is in the no-exam group
          (selectedTitleClassification.includes('no-exam') &&
          NON_EXAM_CLASSES.includes(job.title_classification))
        )
      ) return false;

      return true;
    });
  }, [
    uniqueJobs,
    selectedEmploymentKind,
    selectedSalaryFrequency,
    selectedAgencies,
    selectedTitleClassification
  ]);



    if (loading) return <p className="p-6">Loading NYC job listings…</p>;
    if (error)   return <p className="p-6 text-red-600">Error: {error.message}</p>;

  return (
    <>
    <h1 className='block p-6'>nyc gov jobs</h1>
    <FilterBar
      selectedEmploymentKind={selectedEmploymentKind}
      setSelectedEmploymentKind={setSelectedEmploymentKind}
      selectedSalaryFrequency={selectedSalaryFrequency}
      setSelectedSalaryFrequency={setSelectedSalaryFrequency}
      selectedAgencies={selectedAgencies} 
      setSelectedAgencies={setSelectedAgencies}
      selectedTitleClassification={selectedTitleClassification}
      setSelectedTitleClassification={setSelectedTitleClassification}
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
