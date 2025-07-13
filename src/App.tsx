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

  // Employment Kind Filter 
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

  const agencyCounts = useMemo(() => {
    const map: Record<string, number> = {};
    uniqueJobs.forEach((job) => {
      const key = job.agency;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [uniqueJobs]);

  const agencyOptions = [
    { value: "ADMIN FOR CHILDREN'S SVCS", label: "Admin for Children's Services", count: agencyCounts["ADMIN FOR CHILDREN'S SVCS"] || 0 },
    { value: "ADMIN TRIALS AND HEARINGS", label: "Admin Trials and Hearings", count: agencyCounts["ADMIN TRIALS AND HEARINGS"]|| 0 },
    { value: "BOARD OF CORRECTION", label: "Board of Correction", count: agencyCounts["BOARD OF CORRECTION"]|| 0 },
    { value: "BOROUGH PRESIDENT-BRONX", label: "Borough President-Bronx", count: agencyCounts["BOROUGH PRESIDENT-BRONX"]|| 0 },
    { value: "BRONX COMMUNITY BOARD #4", label: "Bronx Community Board #4", count: agencyCounts["BRONX COMMUNITY BOARD #4"]|| 0 },
    { value: "BRONX COMMUNITY BOARD #5", label: "Bronx Community Board #5", count: agencyCounts["BRONX COMMUNITY BOARD #5"]|| 0 },
    { value: "BRONX COMMUNITY BOARD #8", label: "Bronx Community Board #8", count: agencyCounts["BRONX COMMUNITY BOARD #8"]|| 0 },
    { value: "BRONX DISTRICT ATTORNEY", label: "Bronx District Attorney", count: agencyCounts["BRONX DISTRICT ATTORNEY"]|| 0 },
    { value: "BUSINESS INTEGRITY COMMISSION", label: "Business Integrity Commission", count: agencyCounts["BUSINESS INTEGRITY COMMISSION"]|| 0 },
    { value: "CAMPAIGN FINANCE BOARD", label: "Campaign Finance Board", count: agencyCounts["CAMPAIGN FINANCE BOARD"]|| 0 },
    { value: "CIVILIAN COMPLAINT REVIEW BD", label: "Civilian Complaint Review Bd", count: agencyCounts["CIVILIAN COMPLAINT REVIEW BD"]|| 0 },
    { value: "CONFLICTS OF INTEREST BOARD", label: "Conflicts of Interest Board", count: agencyCounts["CONFLICTS OF INTEREST BOARD"]|| 0 },
    { value: "CONSUMER AND WORKER PROTECTION", label: "Consumer and Worker Protection", count: agencyCounts["CONSUMER AND WORKER PROTECTION"]|| 0 },
    { value: "DEPARTMENT FOR THE AGING", label: "Department for the Aging", count: agencyCounts["DEPARTMENT FOR THE AGING"]|| 0 },
    { value: "DEPARTMENT OF BUILDINGS", label: "Department of Buildings", count: agencyCounts["DEPARTMENT OF BUILDINGS"]|| 0 },
    { value: "DEPARTMENT OF BUSINESS SERV.", label: "Department of Business Services", count: agencyCounts["DEPARTMENT OF BUSINESS SERV."]|| 0 },
    { value: "DEPARTMENT OF CITY PLANNING", label: "Department of City Planning", count: agencyCounts['']|| 0 },
    { value: "DEPARTMENT OF CORRECTION", label: "Department of Correction", count: agencyCounts['']|| 0 },
    { value: "DEPARTMENT OF FINANCE", label: "Department of Finance", count: agencyCounts['']|| 0 },
    { value: "DEPARTMENT OF INVESTIGATION", label: "Department of Investigation", count: agencyCounts['']|| 0 },
    { value: "DEPARTMENT OF PROBATION", label: "Department of Probation", count: agencyCounts["DEPARTMENT OF PROBATION"]|| 0 },
    { value: "DEPARTMENT OF SANITATION", label: "Department of Sanitation", count: agencyCounts['']|| 0 },
    { value: "DEPARTMENT OF TRANSPORTATION", label: "Department of Transportation", count: agencyCounts["DEPARTMENT OF TRANSPORTATION"]|| 0 },
    { value: "DEPT OF CITYWIDE ADMIN SVCS", label: "Dept of Citywide Admin Services", count: agencyCounts["DEPT OF CITYWIDE ADMIN SVCS"]|| 0 },
    { value: "DEPT OF DESIGN & CONSTRUCTION", label: "Dept of Design & Construction", count: agencyCounts["DEPT OF DESIGN & CONSTRUCTION"]|| 0 },
    { value: "DEPT OF ENVIRONMENT PROTECTION", label: "Dept of Environment Protection", count: agencyCounts["DEPT OF ENVIRONMENT PROTECTION"]|| 0 },
    { value: "DEPT OF HEALTH/MENTAL HYGIENE", label: "Dept of Health/Mental Hygiene", count: agencyCounts["DEPT OF HEALTH/MENTAL HYGIENE"]|| 0 },
    { value: "DEPT. OF HOMELESS SERVICES", label: "Dept. of Homeless Services", count: agencyCounts["DEPT. OF HOMELESS SERVICES"]|| 0 },
    { value: "DEPT OF PARKS & RECREATION", label: "Dept of Parks & Recreation", count: agencyCounts["DEPT OF PARKS & RECREATION"]|| 0 },
    { value: "DEPT OF YOUTH & COMM DEV SRVS", label: "Dept of Youth & Comm Dev Services", count: agencyCounts["DEPT OF YOUTH & COMM DEV SRVS"]|| 0 },
    { value: "DISTRICT ATTORNEY KINGS COUNTY", label: "District Attorney Kings County", count: agencyCounts["DISTRICT ATTORNEY KINGS COUNTY"]|| 0 },
    { value: "DISTRICT ATTORNEY-MANHATTAN", label: "District Attorney-Manhattan", count: agencyCounts["DISTRICT ATTORNEY-MANHATTAN"]|| 0 },
    { value: "DISTRICT ATTORNEY RICHMOND COU", label: "District Attorney Richmond Cou", count: agencyCounts["DISTRICT ATTORNEY RICHMOND COU"]|| 0 },
    { value: "FINANCIAL INFO SVCS AGENCY", label: "Financial Info Services Agency", count: agencyCounts["FINANCIAL INFO SVCS AGENCY"]|| 0 },
    { value: "FIRE DEPARTMENT", label: "Fire Department", count: agencyCounts['']|| 0 },
    { value: "HOUSING PRESERVATION & DVLPMNT", label: "Housing Preservation & Development", count: agencyCounts['']|| 0 },
    { value: "HRA/DEPT OF SOCIAL SERVICES", label: "HRA/Dept of Social Services", count: agencyCounts['']|| 0 },
    { value: "HUMAN RIGHTS COMMISSION", label: "Human Rights Commission", count: agencyCounts['']|| 0 },
    { value: "LANDMARKS PRESERVATION COMM", label: "Landmarks Preservation Comm", count: agencyCounts['']|| 0 },
    { value: "LAW DEPARTMENT", label: "Law Department", count: agencyCounts['']|| 0 },
    { value: "MANHATTAN COMMUNITY BOARD #12", label: "Manhattan Community Board #12", count: agencyCounts['']|| 0 },
    { value: "MANHATTAN COMMUNITY BOARD #5", label: "Manhattan Community Board #5", count: agencyCounts['']|| 0 },
    { value: "MAYORS OFFICE OF CONTRACT SVCS", label: "Mayors Office of Contract Services", count: agencyCounts['']|| 0 },
    { value: "MUNICIPAL WATER FIN AUTHORITY", label: "Municipal Water Fin Authority", count: agencyCounts['']|| 0 },
    { value: "NYC DEPT OF VETERANS' SERVICES", label: "NYC Dept of Veterans' Services", count: agencyCounts['']|| 0 },
    { value: "NYC EMPLOYEES RETIREMENT SYS", label: "NYC Employees Retirement Sys", count: agencyCounts['']|| 0 },
    { value: "NYC FIRE PENSION FUND", label: "NYC Fire Pension Fund", count: agencyCounts['']|| 0 },
    { value: "NYC HOUSING AUTHORITY", label: "NYC Housing Authority", count: agencyCounts['']|| 0 },
    { value: "NYC POLICE PENSION FUND", label: "NYC Police Pension Fund", count: agencyCounts['']|| 0 },
    { value: "OFFICE OF CRIMINAL JUSTICE", label: "Office of Criminal Justice", count: agencyCounts['']|| 0 },
    { value: "OFFICE OF EMERGENCY MANAGEMENT", label: "Office of Emergency Management", count: agencyCounts['']|| 0 },
    { value: "OFFICE OF LABOR RELATIONS", label: "Office of Labor Relations", count: agencyCounts['']|| 0 },
    { value: "OFFICE OF MANAGEMENT & BUDGET", label: "Office of Management & Budget", count: agencyCounts['']|| 0 },
    { value: "OFFICE OF THE ACTUARY", label: "Office of the Actuary", count: agencyCounts['']|| 0 },
    { value: "OFFICE OF THE COMPTROLLER", label: "Office of the Comptroller", count: agencyCounts['']|| 0 },
    { value: "OFFICE OF THE MAYOR", label: "Office of the Mayor", count: agencyCounts['']|| 0 },
    { value: "OFF OF PAYROLL ADMINISTRATION", label: "Off of Payroll Administration", count: agencyCounts['']|| 0 },
    { value: "POLICE DEPARTMENT", label: "Police Department", count: agencyCounts["POLICE DEPARTMENT"]|| 0 },
    { value: "PUBLIC ADMINISTRATOR-NEW YORK", label: "Public Administrator-New York", count: agencyCounts['']|| 0 },
    { value: "TAX COMMISSION", label: "Tax Commission", count: agencyCounts['']|| 0 },
    { value: "TAXI & LIMOUSINE COMMISSION", label: "Taxi & Limousine Commission", count: agencyCounts['']|| 0 },
    { value: "TEACHERS RETIREMENT SYSTEM", label: "Teachers Retirement System", count: agencyCounts["TEACHERS RETIREMENT SYSTEM"]|| 0 },
    { value: "TECHNOLOGY & INNOVATION", label: "Technology & Innovation", count: agencyCounts["TECHNOLOGY & INNOVATION"]|| 0  }
  ]







    if (loading) return <p className="p-6">Loading NYC job listings…</p>;
    if (error)   return <p className="p-6 text-red-600">Error: {error.message}</p>;

  return (
    <>
    <h1 className='block p-6'>nyc gov job search</h1>
    <FilterBar
      selectedEmploymentKind={selectedEmploymentKind}
      setSelectedEmploymentKind={setSelectedEmploymentKind}
      selectedSalaryFrequency={selectedSalaryFrequency}
      setSelectedSalaryFrequency={setSelectedSalaryFrequency}
      selectedAgencies={selectedAgencies} 
      setSelectedAgencies={setSelectedAgencies}
      selectedTitleClassification={selectedTitleClassification}
      setSelectedTitleClassification={setSelectedTitleClassification}
      employmentKindOptions={employmentKindOptions}
      // salaryOptions={salaryOptions}
      agencyOptions={agencyOptions}
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
