import CheckboxFilter from './CheckboxFilter'
import type { Option } from './CheckboxFilter'

interface FilterBarProps {
  selectedEmploymentKind: string[]
  setSelectedEmploymentKind: React.Dispatch<React.SetStateAction<string[]>>
  employmentKindOptions: Option[]

  selectedSalaryFrequency: string[]
  setSelectedSalaryFrequency: React.Dispatch<React.SetStateAction<string[]>>
  salaryFrequencyOptions: Option[]

  selectedAgencies: string[]
  setSelectedAgencies: React.Dispatch<React.SetStateAction<string[]>>
  agencyFilterOptions: Option[]

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

  selectedSalaryFrom: number[]
  setSelectedSalaryFrom: React.Dispatch<React.SetStateAction<number[]>>
  SalaryFromOptions: Option[]
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
  agencyFilterOptions,
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
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
          id="agency"
          label="Agency"
          options={agencyFilterOptions}
          selected={selectedAgencies}
          onChange={setSelectedAgencies}
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
          id="postingAge"
          label="Date Posted Within"
          options={postingAgeOptions}
          selected={selectedPostingAge}
          onChange={setSelectedPostingAge}
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
