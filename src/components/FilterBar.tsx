import CheckboxFilter from './CheckboxFilter';

interface FilterBarProps {
  selectedEmploymentKind: string[];
  setSelectedEmploymentKind: React.Dispatch<React.SetStateAction<string[]>>;
  employmentKindOptions: any[];
  selectedSalaryFrequency: string[];
  setSelectedSalaryFrequency: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAgencies: string[];
  setSelectedAgencies: React.Dispatch<React.SetStateAction<string[]>>;
  agencyFilterOptions: any[];
  selectedTitleClassification: string[];
  setSelectedTitleClassification: React.Dispatch<React.SetStateAction<string[]>>;
  titleClassificationOptions: any[];
}


export function FilterBar({
  selectedEmploymentKind,
  setSelectedEmploymentKind,
  employmentKindOptions,
  selectedSalaryFrequency,
  setSelectedSalaryFrequency,
  selectedAgencies,
  setSelectedAgencies,
  agencyFilterOptions,
  selectedTitleClassification,
  setSelectedTitleClassification,
  titleClassificationOptions

}: FilterBarProps ) {

  return(
    <section className="bg-gray-200 p-4 md:p-6 shadow-sm mb-6">
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
        label="Employment Type"
        options={employmentKindOptions}
        selected={selectedEmploymentKind}
        onChange={setSelectedEmploymentKind}
      />
      <CheckboxFilter
        id="salary_frequency"
        label="Salary Frequency"
        options={[
          { value: 'Annual', label: 'Annual' },
          { value: 'Hourly', label: 'Hourly' },
          { value: 'Daily', label: 'Daily' },
        ]}
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

      </div>
    </section>
  )
};