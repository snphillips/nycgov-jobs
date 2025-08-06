import type { NYCJobType } from '../types'

// Props passed into the FilterResultsBar
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

// All possible filter categories used for filter pills
type FilterCategory =
  | 'selectedEmploymentKind'
  | 'selectedSalaryFrequency'
  | 'selectedAgencies'
  | 'selectedTitleClassification'
  | 'selectedCivilServiceTitle'
  | 'selectedLevel'
  | 'selectedPostingAge'

// Structure of each filter pill
interface FilterPill {
  value: string
  label: string
  category: FilterCategory
  remove: () => void
}

export function FilterResultsBar({
  filteredJobs,
  filterState,
}: FilterResultsBarProps) {
  // Create an array of filter pills with label + remove logic
  function buildFilterPills(): FilterPill[] {
    const pillList: FilterPill[] = []

    // Human-readable mapping for coded filter values
    const readableLabelMap: Record<string, string> = {
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

    /**
     * Helper to convert selected values into pills
     */
    const addPills = (
      category: FilterCategory,
      selectedValues: string[],
      setSelectedValues: (values: string[]) => void,
      formatLabel: (value: string) => string = (value) => value
    ) => {
      selectedValues.forEach((selectedValue) => {
        pillList.push({
          value: selectedValue,
          category,
          label: formatLabel(selectedValue),
          remove: () =>
            setSelectedValues(
              selectedValues.filter((v) => v !== selectedValue)
            ),
        })
      })
    }

    // Build pills for each filter type
    addPills(
      'selectedEmploymentKind',
      filterState.selectedEmploymentKind,
      filterState.setSelectedEmploymentKind,
      (value) => readableLabelMap[value] || value
    )

    addPills(
      'selectedSalaryFrequency',
      filterState.selectedSalaryFrequency,
      filterState.setSelectedSalaryFrequency,
      (value) => readableLabelMap[value] || value
    )

    addPills(
      'selectedTitleClassification',
      filterState.selectedTitleClassification,
      filterState.setSelectedTitleClassification,
      (value) => readableLabelMap[value] || value
    )

    addPills(
      'selectedPostingAge',
      filterState.selectedPostingAge,
      filterState.setSelectedPostingAge,
      (value) => readableLabelMap[value] || value
    )

    addPills(
      'selectedAgencies',
      filterState.selectedAgencies,
      filterState.setSelectedAgencies,
      (value) => value.toLowerCase()
    )

    addPills(
      'selectedCivilServiceTitle',
      filterState.selectedCivilServiceTitle,
      filterState.setSelectedCivilServiceTitle,
      (value) => value.toLowerCase()
    )

    addPills(
      'selectedLevel',
      filterState.selectedLevel,
      filterState.setSelectedLevel,
      (value) => `level ${value.toLowerCase()}`
    )

    return pillList
  }

  const selectedFilterPills = buildFilterPills()

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 text-sm text-stone-300">
      {/* Job count header */}
      <h2 className="font-semibold">
        {filteredJobs.length} jobs match your criteria
      </h2>

      {/* Display selected filter pills with remove buttons */}
      {selectedFilterPills.map((pill) => (
        <span
          key={`${pill.category}-${pill.value}`}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-stone-200 text-gray-800 text-xs"
        >
          {pill.label}
          <button
            onClick={pill.remove}
            className="ml-1 text-xs text-gray-600 hover:text-black"
            aria-label={`Remove ${pill.label} filter`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}

export default FilterResultsBar
