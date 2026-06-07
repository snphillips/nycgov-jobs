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
    selectedSalaryFrom: string[]
    setSelectedSalaryFrom: (val: string[]) => void
  }
  showFavoriteJobs: boolean
  showHiddenJobs: boolean
  onShowAllJobs: () => void
}

/**
 * FilterResultsBar
 *
 * Displays a summary bar below the filters showing:
 *   - How many jobs match the current filters (or how many are favorited/hidden)
 *   - A pill for each active filter the user can click to remove individually
 *   - A "Clear all" button when multiple filters are active
 *   - A "Back to all jobs" button when in favorites or hidden mode
 *
 * Junior Dev note: this component doesn't manage any filter state itself —
 * it receives the current selections and their setters from the parent via
 * filterState props, and calls those setters to remove individual filters.
 */

export function FilterResultsBar({
  filteredJobs,
  filterState,
  showFavoriteJobs,
  showHiddenJobs,
  onShowAllJobs,
}: FilterResultsBarProps) {
  // Map raw API/internal filter values to user-friendly pill labels
  const filterPillLabelMap: Record<string, string> = {
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

  // Filter category configs (with pill colors).
  // To add a new filter type, add one entry here — no other changes needed.
  const filterConfigs = [
    {
      category: 'employment',
      values: filterState.selectedEmploymentKind,
      setValues: filterState.setSelectedEmploymentKind,
      format: (filterPillValue: string) =>
        filterPillLabelMap[filterPillValue] || filterPillValue,
      filterPillColor: 'bg-blue-100 text-blue-800',
    },
    {
      category: 'salaryFrequency',
      values: filterState.selectedSalaryFrequency,
      setValues: filterState.setSelectedSalaryFrequency,
      format: (filterPillValue: string) =>
        filterPillLabelMap[filterPillValue] || filterPillValue,
      filterPillColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      category: 'classification',
      values: filterState.selectedTitleClassification,
      setValues: filterState.setSelectedTitleClassification,
      format: (filterPillValue: string) =>
        filterPillLabelMap[filterPillValue] || filterPillValue,
      filterPillColor: 'bg-purple-100 text-purple-800',
    },
    {
      category: 'postingAge',
      values: filterState.selectedPostingAge,
      setValues: filterState.setSelectedPostingAge,
      format: (filterPillValue: string) =>
        filterPillLabelMap[filterPillValue] || filterPillValue,
      filterPillColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      category: 'agency',
      values: filterState.selectedAgencies,
      setValues: filterState.setSelectedAgencies,
      format: (filterPillValue: string) => filterPillValue.toLowerCase(),
      filterPillColor: 'bg-lime-100 text-lime-800',
    },
    {
      category: 'civilService',
      values: filterState.selectedCivilServiceTitle,
      setValues: filterState.setSelectedCivilServiceTitle,
      format: (filterPillValue: string) => filterPillValue.toLowerCase(),
      filterPillColor: 'bg-orange-100 text-orange-800',
    },
    {
      category: 'level',
      values: filterState.selectedLevel,
      setValues: filterState.setSelectedLevel,
      format: (filterPillValue: string) =>
        `level ${filterPillValue.toLowerCase()}`,
      filterPillColor: 'bg-sky-100 text-sky-800',
    },
    {
      category: 'salaryRangeFrom',
      values: filterState.selectedSalaryFrom,
      setValues: filterState.setSelectedSalaryFrom,
      // TODO: raw bucket key (e.g. "annual:60000-80000") is shown here —
      // ideally this would use the human-readable label from salaryFromOptions
      format: (filterPillValue: string) => `$ ${filterPillValue}`,
      filterPillColor: 'bg-green-100 text-green-800',
    },
  ]

  // Flatten into pill models (only used in normal mode).
  // In favorites/hidden mode we suppress pills since filters aren't active.
  const filterPills =
    showFavoriteJobs || showHiddenJobs
      ? []
      : filterConfigs.flatMap(
          ({ values, setValues, format, filterPillColor }) =>
            values.map((value) => ({
              filterPillLabel: format(value),
              // Remove this single value from its filter group when clicked
              onRemove: () => setValues(values.filter((v) => v !== value)),
              filterPillColor,
            }))
        )

  // Clear all filters at once (hidden in favorites/hidden modes)
  const clearAllFilters = () => {
    filterState.setSelectedEmploymentKind([])
    filterState.setSelectedSalaryFrequency([])
    filterState.setSelectedAgencies([])
    filterState.setSelectedTitleClassification([])
    filterState.setSelectedCivilServiceTitle([])
    filterState.setSelectedLevel([])
    filterState.setSelectedPostingAge([])
    filterState.setSelectedSalaryFrom([])
  }

  // Build the header text based on which display mode is active
  let dynamicHeaderText = `${filteredJobs.length} jobs match your criteria`
  if (showFavoriteJobs) {
    dynamicHeaderText = `Showing ${filteredJobs.length} favorite job${
      filteredJobs.length !== 1 ? 's' : ''
    }`
  } else if (showHiddenJobs) {
    dynamicHeaderText = `Showing ${filteredJobs.length} hidden job${
      filteredJobs.length !== 1 ? 's' : ''
    }`
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-6 text-sm text-stone-300">
      <h2 className="filter-results-bar-header font-semibold">
        {dynamicHeaderText}
      </h2>

      {/* Show a back button when in favorites or hidden mode instead of filter pills */}
      {(showFavoriteJobs || showHiddenJobs) && (
        <button
          type="button"
          onClick={onShowAllJobs}
          className="ml-2 px-3 py-1 rounded-full bg-stone-200 text-stone-800 text-xs font-medium hover:bg-stone-300"
          aria-label="Back to all jobs"
        >
          ← Back to all jobs
        </button>
      )}

      {/* Pills only when showing regular filter results (not faves or hidden) */}
      {filterPills.map(({ filterPillLabel, onRemove, filterPillColor }) => (
        <span
          key={filterPillLabel}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${filterPillColor}`}
        >
          {filterPillLabel}
          <button
            onClick={onRemove}
            className="ml-1 text-xs hover:text-black"
            aria-label={`remove ${filterPillLabel} filter`}
          >
            ×
          </button>
        </span>
      ))}

      {/* Clear-all only in regular filter mode and when there are pills */}
      {filterPills.length > 0 && !showFavoriteJobs && !showHiddenJobs && (
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
