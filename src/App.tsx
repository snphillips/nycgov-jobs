import { useState, useMemo } from 'react';
import JobCard from './components/JobCard';
import type { NYCJobType } from './types'
import { useNYCJobs } from './hooks/useNYCJobs';
import { FilterBar } from './components/FilterBar';
import { toTitleCase}  from "./utils"

const NON_EXAM_CLASSES = [
  'Pending Classification-2',
  'Labor-3',
  'Exempt-4',
  'Non-Competitive-5',
];


export function App() {
  const { jobs, loading, error } = useNYCJobs(); 
  const [favoriteJobs, setFavoriteJobs] = useState<Set<string>>(new Set());
  const [applied, setApplied]     = useState<Set<string>>(new Set());

  /* ─────────── Filters ─────────── */
  const [selectedEmploymentKind, setSelectedEmploymentKind] = useState<string[]>([]);
  const [selectedSalaryFrequency, setSelectedSalaryFrequency] = useState<string[]>([]);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [selectedTitleClassification, setSelectedTitleClassification] = useState<string[]>([]);
  const [selectedPostingType, setSelectedPostingType] = useState<string[]>([]);

  

  const toggleFavorite = (job: NYCJobType) => {
    setFavoriteJobs(prev => {
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

  // De-duplicate rows by job_id 
  // I don't know why, but the data contains jobs with duplicate job_id
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
        selectedPostingType.length > 0 &&
        !selectedPostingType.includes(job.posting_type)
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
    selectedTitleClassification,
    selectedPostingType
  ]);

  // ==============================
  // Employment Kind Filter Options
  // ==============================
  const employmentCounts = useMemo(() => {  
  const map: Record<string, number> = {};
  uniqueJobs.forEach((job) => {
    map[job.full_time_part_time_indicator] = (map[job.full_time_part_time_indicator] || 0) + 1;
  });
  return map;
  }, [uniqueJobs]);

  const employmentKindOptions = [
    { value: 'F', label: 'Full-Time', count: employmentCounts['F'] || 0 },
    { value: 'P', label: 'Part-Time', count: employmentCounts['P'] || 0 },
  ];
  // ==============================

  // ==============================
  // Agency Filter Options
  // ============================== 
  const agencyFilterOptions = useMemo(() => {
    const counts: Record<string, number> = {};

    uniqueJobs.forEach((job) => {
      if (!job.agency) return;
      counts[job.agency] = (counts[job.agency] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([agency, count]) => ({
        value: agency,
        label: toTitleCase(agency),
        count,
      }));
  }, [uniqueJobs]);
  // ==============================

  // ==============================
  // Salary Frequency Options
  // ============================== 
   const salaryFrequencyCounts = useMemo(() => {  
      const map: Record<string, number> = {};
      uniqueJobs.forEach((job) => {
        map[job.salary_frequency] = (map[job.salary_frequency] || 0) + 1;
      });
      return map;
    }, [uniqueJobs]);
    
    const salaryFrequencyOptions =   [
      { value: 'Annual', label: 'Annual', count: salaryFrequencyCounts['Annual'] || 0 },
      { value: 'Hourly', label: 'Hourly', count: salaryFrequencyCounts['Hourly'] || 0},
      { value: 'Daily', label: 'Daily', count: salaryFrequencyCounts['Daily'] || 0},
    ]
    // ==============================


  // ==============================
  // Civil Service Exam Options
  // ============================== 

const titleClassificationOptions = useMemo(() => {
  const NON_EXAM_CLASSES = [
  'Pending Classification-2',
  'Labor-3',
  'Exempt-4',
  'Non-Competitive-5',
];

  let examCount = 0;
  let noExamCount = 0;

  uniqueJobs.forEach((job) => {
    if (job.title_classification === 'Competitive-1') {
      examCount++;
    } else if (NON_EXAM_CLASSES.includes(job.title_classification)) {
      noExamCount++;
    }
  });

  return [
    { value: 'Competitive-1', label: 'Yes', count: examCount },
    { value: 'no-exam', label: 'No', count: noExamCount },
  ];
}, [uniqueJobs]);
// ==============================


    // ==============================
    // Employment Kind (Internal/External) Filter Options
    // ==============================
    const postingTypeCounts = useMemo(() => {  
      const map: Record<string, number> = {};
      uniqueJobs.forEach((job) => {
        map[job.posting_type] = (map[job.posting_type] || 0) + 1;
      });
      return map;
    }, [uniqueJobs]);
    
    const postingTypeOptions = [
      {value: 'Internal', label: 'Internal', count: postingTypeCounts['Internal'] || 0},
      {value: 'External', label: 'External', count: postingTypeCounts['External'] || 0},
    ]
    // ==============================



 
    if (loading) return <p className="p-6">Loading NYC job listings…</p>;
    if (error)   return <p className="p-6 text-red-600">Error: {error.message}</p>;

  return (
    <>
    <h1 className='block p-6'>nyc gov job search</h1>
    <div role="doc-subtitle" className='pl-6 pb-6 font-semibold'>Search for nyc.gov jobs</div>
    <FilterBar
      selectedEmploymentKind={selectedEmploymentKind}
      setSelectedEmploymentKind={setSelectedEmploymentKind}
      employmentKindOptions={employmentKindOptions}

      selectedAgencies={selectedAgencies} 
      setSelectedAgencies={setSelectedAgencies}
      agencyFilterOptions={agencyFilterOptions}
      
      selectedTitleClassification={selectedTitleClassification}
      setSelectedTitleClassification={setSelectedTitleClassification}
      titleClassificationOptions={titleClassificationOptions}
      
      selectedPostingType={selectedPostingType}
      setSelectedPostingType={setSelectedPostingType}
      postingTypeOptions={postingTypeOptions}
      
      selectedSalaryFrequency={selectedSalaryFrequency}
      setSelectedSalaryFrequency={setSelectedSalaryFrequency}
      salaryFrequencyOptions={salaryFrequencyOptions}
      />

    <h2 className="text-lg font-semibold mb-4 text-center text-gray-300 p-3">{filteredJobs.length} jobs match your criteria</h2>
<main className="columns-1 sm:columns-2 xl:columns-4 gap-6 p-6 bg-gray-50">
  {filteredJobs.map((job) => (
    <div key={`${job.job_id}-${job.posting_updated}`} className="mb-6 break-inside-avoid">
      <JobCard
        job={job}
        onFavorite={toggleFavorite}
        onApplied={markApplied}
        isFavorited={favoriteJobs.has(job.job_id)}
        isApplied={applied.has(job.job_id)}
      />
    </div>
  ))}
</main>
    </>
  );
};

export default App;
