import CheckboxFilter from './CheckboxFilter'

interface FilterBarProps {
  selectedEmploymentKind: string[]
  setSelectedEmploymentKind: React.Dispatch<React.SetStateAction<string[]>>
  employmentKindOptions: any[]

  selectedSalaryFrequency: string[]
  setSelectedSalaryFrequency: React.Dispatch<React.SetStateAction<string[]>>
  salaryFrequencyOptions: any

  selectedAgencies: string[]
  setSelectedAgencies: React.Dispatch<React.SetStateAction<string[]>>
  agencyFilterOptions: any[]

  selectedTitleClassification: string[]
  setSelectedTitleClassification: React.Dispatch<React.SetStateAction<string[]>>
  titleClassificationOptions: any[]

  selectedPostingType: string[]
  setSelectedPostingType: React.Dispatch<React.SetStateAction<string[]>>
  postingTypeOptions: any[]

  selectedCivilServiceTitle: string[]
  setSelectedCivilServiceTitle: React.Dispatch<React.SetStateAction<string[]>>
  civilServiceTitleOptions: any[]
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
  titleClassificationOptions,
  selectedPostingType,
  setSelectedPostingType,
  postingTypeOptions,
  selectedCivilServiceTitle,
  setSelectedCivilServiceTitle,
  civilServiceTitleOptions,
}: FilterBarProps) {
  return (
    <section className="bg-stone-300 p-4 md:p-4 shadow-sm mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Filter Jobs</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <CheckboxFilter
          id="title_classification"
          label="Exam Required"
          options={titleClassificationOptions}
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
          id="posting_type"
          label="Internal/External"
          options={postingTypeOptions}
          selected={selectedPostingType}
          onChange={setSelectedPostingType}
        />

        <CheckboxFilter
          id="civil_service_title"
          label="Civil Service Title"
          options={civilServiceTitleOptions}
          selected={selectedCivilServiceTitle}
          onChange={setSelectedCivilServiceTitle}
        />
      </div>
    </section>
  )
}
