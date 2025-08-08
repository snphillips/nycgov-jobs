import type { NYCJobType } from '../types'

interface FilterResultsBarProps {
  filteredJobs: NYCJobType[]
  filterState: {
    selectedEmploymentKind: string[]
    setSelectedEmploymentKind: (val: string[]) => void
    selectedSalaryFrequency: string[]
    setSelectedSalaryFrequency: (val: string[]) => void
    selectedAgencies: string[]
    setSelectedAgencies: (val: string[]) => void
    selectedTitleClassification: string[]
    setSelectedTitleClassification: (val: string[]) => void
    selectedCivilServiceTitle: string[]
    setSelectedCivilServiceTitle: (val: string[]) => void
    selectedLevel: string[]
    setSelectedLevel: (val: string[]) => void
    selectedPostingAge: string[]
    setSelectedPostingAge: (val: string[]) => void
  }
}

export function FilterResultsBar({
  filteredJobs,
  filterState,
}: FilterResultsBarProps) {
  // Map raw filter values to user-friendly labels
  const labelMap: Record<string, string> = {
    F: 'full time',
    P: 'part time',
    Annual: 'annual salary',
    Hourly: 'hourly wage',
    Daily: 'daily rate',
    'Competitive-1': 'exam required',
    'no-exam': 'no exam',
    '1w': '1 week',
    '2w': '2 weeks',
    '3w': '3 weeks',
    '1m': 'one month',
    '6m': 'six months',
  }

  const filterConfigs = [
    {
      category: 'employment',
      values: filterState.selectedEmploymentKind,
      setValues: filterState.setSelectedEmploymentKind,
      format: (val: string) => labelMap[val] || val,
      filterPillColor: 'bg-blue-100 text-blue-800',
    },
    {
      category: 'salary',
      values: filterState.selectedSalaryFrequency,
      setValues: filterState.setSelectedSalaryFrequency,
      format: (val: string) => labelMap[val] || val,
      filterPillColor: 'bg-green-100 text-green-800',
    },
    {
      category: 'classification',
      values: filterState.selectedTitleClassification,
      setValues: filterState.setSelectedTitleClassification,
      format: (val: string) => labelMap[val] || val,
      filterPillColor: 'bg-purple-100 text-purple-800',
    },
    {
      category: 'postingAge',
      values: filterState.selectedPostingAge,
      setValues: filterState.setSelectedPostingAge,
      format: (val: string) => labelMap[val] || val,
      filterPillColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      category: 'agency',
      values: filterState.selectedAgencies,
      setValues: filterState.setSelectedAgencies,
      format: (val: string) => val.toLowerCase(),
      filterPillColor: 'bg-lime-100 text-lime-800',
    },
    {
      category: 'civilService',
      values: filterState.selectedCivilServiceTitle,
      setValues: filterState.setSelectedCivilServiceTitle,
      format: (val: string) => val.toLowerCase(),
      filterPillColor: 'bg-orange-100 text-orange-800',
    },
    {
      category: 'level',
      values: filterState.selectedLevel,
      setValues: filterState.setSelectedLevel,
      format: (val: string) => `level ${val.toLowerCase()}`,
      filterPillColor: 'bg-sky-100 text-sky-800',
    },
  ]

  const filterPills = filterConfigs.flatMap(
    ({ category, values, setValues, format, filterPillColor }) =>
      values.map((value) => ({
        label: format(value),
        onRemove: () => setValues(values.filter((v) => v !== value)),
        category,
        filterPillColor,
      }))
  )

  const clearAllFilters = () => {
    filterState.setSelectedEmploymentKind([])
    filterState.setSelectedSalaryFrequency([])
    filterState.setSelectedAgencies([])
    filterState.setSelectedTitleClassification([])
    filterState.setSelectedCivilServiceTitle([])
    filterState.setSelectedLevel([])
    filterState.setSelectedPostingAge([])
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-6 text-sm text-stone-300">
      <h2 className="font-semibold">
        {filteredJobs.length} jobs match your criteria
      </h2>

      {filterPills.map(({ label, onRemove, filterPillColor }, index) => (
        <span
          key={`${label}-${index}`}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${filterPillColor}`}
        >
          {label}
          <button
            onClick={onRemove}
            className="ml-1 text-xs hover:text-black"
            aria-label={`remove ${label} filter`}
          >
            ×
          </button>
        </span>
      ))}

      {filterPills.length > 0 && (
        <button
          onClick={clearAllFilters}
          className="ml-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200"
        >
          🧹 Clear all filters
        </button>
      )}
    </div>
  )
}

export default FilterResultsBar
