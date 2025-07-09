import SelectFilter from "./SelectFilter";

interface FilterBarProps {
  employmentKindFilter: any;
  setEmploymentKindFilter: any;
  salaryFrequencyFilter: any;
  setSalaryFrequencyFilter: any;
}

export function FilterBar({
  employmentKindFilter,
  setEmploymentKindFilter,
  salaryFrequencyFilter,
  setSalaryFrequencyFilter
}: FilterBarProps ) {

  return(
    <>
      <SelectFilter
        id="employmentType"
        label="Employment Type"
        options={[
          { value: 'F', label: 'Full-Time' },
          { value: 'P', label: 'Part-Time' },
        ]}
        includeAllOption
        value={employmentKindFilter}
        onChange={setEmploymentKindFilter}
      />
      <SelectFilter
        id="salary_frequency"
        label="Salary Frequency"
        options={[
          { value: 'Annual', label: 'Annual' },
          { value: 'Hourly', label: 'Hourly' },
        ]}
        includeAllOption
        value={salaryFrequencyFilter}
        onChange={setSalaryFrequencyFilter}
      />
    </>
  )
};