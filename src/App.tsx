import { type FC, useState } from 'react';
import JobCard from './components/JobCard';
import type { NYCJobType } from './types'
import { useNYCJobs } from './hooks/useNYCJobs';

/* Temporary stub data – replace with API fetch later */
const sampleJobs: NYCJobType[] = [
    {
      job_id: "694510",
      agency: "DEPARTMENT OF CORRECTION",
      posting_type: "Internal",
      number_of_positions: "1",
      business_title: "Technical Project Manager",
      civil_service_title: "IT PROJECT SPECIALIST",
      title_classification: "Non-Competitive-5",
      title_code_no: "95710",
      level: "00",
      job_category: "Technology, Data & Innovation",
      full_time_part_time_indicator: "F",
      career_level: "Experienced (non-manager)",
      salary_range_from: "130000",
      salary_range_to: "150000",
      salary_frequency: "Annual",
      work_location: "75-20 Astoria Blvd",
      division_work_unit: "Information Systems-Admin",
      job_description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      preferred_skills: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      residency_requirement: "New York City Residency is not required for this position",
      posting_date: "2024-12-19T00:00:00.000",
      post_until: "07-JUL-2025",
      posting_updated: "2025-05-22T00:00:00.000",
      process_date: "2025-07-01T00:00:00.000",
      minimum_qual_requirements: '',
      to_apply: '',
      hours_shift: '',
      work_location_1: ''
    },
  {
    job_id: '634284',
    agency: 'DEPT OF ENVIRONMENT PROTECTION',
    posting_type: 'External',
    number_of_positions: '1',
    business_title: 'Facility Manager',
    civil_service_title: 'ADMINISTRATIVE ENGINEER',
    title_classification: 'Competitive-1',
    title_code_no: '10015',
    level: 'M3',
    job_category: 'Engineering, Architecture, & Planning',
    full_time_part_time_indicator: 'F',
    career_level: 'Manager',
    salary_range_from: '78721',
    salary_range_to: '209971',
    salary_frequency: 'Annual',
    work_location: '154 St. Powells Cove-Whiteston',
    division_work_unit: 'TALLMAN ISLAND PLANT',
    job_description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    minimum_qual_requirements: '',
    to_apply: 'Click Apply Now button.',
    hours_shift: '35 hours per week/day',
    work_location_1: 'Various',
    residency_requirement: 'NYC Residency not required',
    posting_date: '2024-06-13T00:00:00.000',
    posting_updated: '2024-06-13T00:00:00.000',
    process_date: '2025-07-01T00:00:00.000',
  }
];

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

    if (loading) return <p className="p-6">Loading NYC job listings…</p>;
    if (error)   return <p className="p-6 text-red-600">Error: {error.message}</p>;

  return (
    <>
    <h1>The City of New York Jobs</h1>
    <main className="grid gap-6 p-6 sm:grid-cols-2 xl:grid-cols-3 bg-gray-50 min-h-screen">
      {jobs.map((job) => (
        <JobCard
          key={job.job_id}
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
