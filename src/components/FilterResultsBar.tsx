interface FilterResultsBarProps {
  filteredJobs: any[]
  filterState: {
    selectedEmploymentKind: string[]
    selectedSalaryFrequency: string[]
    selectedAgencies: string[]
    selectedTitleClassification: string[]
    selectedCivilServiceTitle: string[]
    selectedLevel: string[]
    selectedPostingAge: string[]
  }
}

export function FilterResultsBar({
  filteredJobs,
  filterState,
}: FilterResultsBarProps) {
  function getSelectedFiltersArray({
    selectedEmploymentKind,
    selectedSalaryFrequency,
    selectedAgencies,
    selectedTitleClassification,
    selectedCivilServiceTitle,
    selectedLevel,
    selectedPostingAge,
  }: {
    selectedEmploymentKind: string[]
    selectedSalaryFrequency: string[]
    selectedAgencies: string[]
    selectedTitleClassification: string[]
    selectedCivilServiceTitle: string[]
    selectedLevel: string[]
    selectedPostingAge: string[]
  }): string[] {
    const labels: string[] = []

    const filterOptionMap: Record<string, string> = {
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

    selectedEmploymentKind.forEach((v) => labels.push(filterOptionMap[v] || v))
    selectedSalaryFrequency.forEach((v) => labels.push(filterOptionMap[v] || v))
    selectedTitleClassification.forEach((v) =>
      labels.push(filterOptionMap[v] || v)
    )
    selectedPostingAge.forEach((v) => labels.push(filterOptionMap[v] || v))
    selectedAgencies.forEach((v) => labels.push(v.toLowerCase()))
    selectedCivilServiceTitle.forEach((v) => labels.push(v.toLowerCase()))
    selectedLevel.forEach((v) => labels.push(`level ${v.toLowerCase()}`))

    return labels
  }

  return (
    <div className="flex flex-wrap  items-center gap-2 p-3 text-sm text-stone-300">
      <h2 className="font-semibold">
        {filteredJobs.length} jobs match your criteria
      </h2>

      {getSelectedFiltersArray({
        selectedEmploymentKind: filterState.selectedEmploymentKind,
        selectedSalaryFrequency: filterState.selectedSalaryFrequency,
        selectedAgencies: filterState.selectedAgencies,
        selectedTitleClassification: filterState.selectedTitleClassification,
        selectedCivilServiceTitle: filterState.selectedCivilServiceTitle,
        selectedLevel: filterState.selectedLevel,
        selectedPostingAge: filterState.selectedPostingAge,
      }).map((label, idx) => (
        <span
          key={idx}
          className="px-3 py-1 rounded-full bg-stone-200 text-gray-800 text-xs"
        >
          {label}
        </span>
      ))}
    </div>
  )
}

export default FilterResultsBar
