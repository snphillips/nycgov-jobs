import CheckboxFilter from './CheckboxFilter'
import type { Option } from '../types'

/**
 * FilterBar
 *
 * Renders the full row of filter controls above the job listing.
 * Each filter is a CheckboxFilter — a labeled group of checkboxes
 * where the user can select one or more values to narrow results.
 *
 * This component is a "pass-through" — it doesn't manage any state itself.
 * It receives selected values and setter functions from useJobFilters (via
 * App.tsx) and forwards them to each CheckboxFilter.
 *
 * To add a new filter: add its props to FilterBarProps and add a
 * <CheckboxFilter /> entry in the grid below.
 */

interface FilterBarProps {
  selectedEmploymentKind: string[]
  // React.Dispatch<React.SetStateAction<string[]>> is the TypeScript type for
  // a useState setter function — it's what you get back from useState<string[]>()
  setSelectedEmploymentKind: React.Dispatch<React.SetStateAction<string[]>>
  employmentKindOptions: Option[]

  selectedSalaryFrequency: string[]
  setSelectedSalaryFrequency: React.Dispatch<React.SetStateAction<string[]>>
  salaryFrequencyOptions: Option[]

  selectedAgencies: string[]
  setSelectedAgencies: React.Dispatch<React.SetStateAction<string[]>>
  agenciesFilterOptions: Option[]

  selectedOmittedAgencies: string[]
  setSelectedOmittedAgencies: React.Dispatch<React.SetStateAction<string[]>>
  omittedAgenciesFilterOptions: Option[]

  selectedTitleClassification: string[]
  setSelectedTitleClassification: React.Dispatch<React.SetStateAction<string[]>>
  examTitleClassificationOptions: Option[]

  selectedCivilServiceTitle: string[]
  setSelectedCivilServiceTitle: React.Dispatch<React.SetStateAction<string[]>>
  civilServiceTitleOptions: Option[]

  selectedLevel: string[]
  setSelectedLevel: React.Dispatch<React.SetStateAction<string[]>>
  levelOptions: Option[]

  selectedPostingAge: string[]
  setSelectedPostingAge: React.Dispatch<React.SetStateAction<string[]>>
  postingAgeOptions: Option[]

  selectedSalaryFrom: string[]
  setSelectedSalaryFrom: React.Dispatch<React.SetStateAction<string[]>>
  salaryFromOptions: Option[]
}

export function FilterBar({
  selectedEmploymentKind,
  setSelectedEmploymentKind,
  employmentKindOptions,
  selectedSalaryFrequency,
  setSelectedSalaryFrequency,
  salaryFrequencyOptions,
  selectedAgencies,
  setSelectedAgencies,
  agenciesFilterOptions,
  selectedOmittedAgencies,
  setSelectedOmittedAgencies,
  omittedAgenciesFilterOptions,
  selectedTitleClassification,
  setSelectedTitleClassification,
  examTitleClassificationOptions,
  selectedCivilServiceTitle,
  setSelectedCivilServiceTitle,
  civilServiceTitleOptions,
  selectedLevel,
  setSelectedLevel,
  levelOptions,
  postingAgeOptions,
  selectedPostingAge,
  setSelectedPostingAge,
  salaryFromOptions,
  selectedSalaryFrom,
  setSelectedSalaryFrom,
}: FilterBarProps) {
  return (
    <section className="bg-stone-300 p-4 md:p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Filter Jobs</h2>
      {/* Responsive grid: 1 column on mobile, 3 on medium screens, 4 on large */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <CheckboxFilter
          id="postingAge"
          label="Date Posted Within"
          options={postingAgeOptions}
          selected={selectedPostingAge}
          onChange={setSelectedPostingAge}
        />
        <CheckboxFilter
          id="title_classification"
          label="Exam Required"
          options={examTitleClassificationOptions}
          selected={selectedTitleClassification}
          onChange={setSelectedTitleClassification}
        />
        <CheckboxFilter
          id="employmentType"
          label="Part Time/Full Time"
          options={employmentKindOptions}
          selected={selectedEmploymentKind}
          onChange={setSelectedEmploymentKind}
        />
        <CheckboxFilter
          id="salary_frequency"
          label="Salary Frequency"
          options={salaryFrequencyOptions}
          selected={selectedSalaryFrequency}
          onChange={setSelectedSalaryFrequency}
        />
        <CheckboxFilter
          id="omitted_agency"
          label="Agency"
          options={agenciesFilterOptions}
          selected={selectedAgencies}
          onChange={setSelectedAgencies}
        />
        <CheckboxFilter
          id="omittedAgencies"
          label="Exclude Agency"
          options={omittedAgenciesFilterOptions}
          selected={selectedOmittedAgencies}
          onChange={setSelectedOmittedAgencies}
        />
        <CheckboxFilter
          id="civil_service_title"
          label="Civil Service Title"
          options={civilServiceTitleOptions}
          selected={selectedCivilServiceTitle}
          onChange={setSelectedCivilServiceTitle}
        />
        <CheckboxFilter
          id="level"
          label="Level"
          options={levelOptions}
          selected={selectedLevel}
          onChange={setSelectedLevel}
        />
        <CheckboxFilter
          id="salaryFrom"
          label="Starting Salary"
          options={salaryFromOptions}
          selected={selectedSalaryFrom}
          onChange={setSelectedSalaryFrom}
        />
      </div>
    </section>
  )
}
