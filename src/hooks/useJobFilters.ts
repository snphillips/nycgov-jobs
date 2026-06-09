/**
 * useJobFilters.ts
 *
 * The main entry point for the job filter system. This hook is intentionally
 * thin — it owns the filter state and delegates all the heavy lifting to:
 *
 *   - applyFilters (jobFilterUtils.ts)  — the actual filter predicate logic
 *   - useFilterOptions (useFilterOptions.ts) — building the dropdown option lists
 *
 * Junior Dev note: this is the "orchestrator" pattern. Rather than one giant
 * file doing everything, this hook composes smaller focused pieces. If you
 * want to understand the filter logic, look at jobFilterUtils.ts. If you want
 * to understand how counts are calculated, look at useFilterOptions.ts.
 */

import { useMemo, useState } from 'react'
import type { NYCJobType, FilterSelections } from '../types'
import { applyFilters } from './jobFilterUtils'
import { useFilterOptions } from './useFilterOptions'

export function useJobFilters(jobs: NYCJobType[]) {
  /* ── Filter state ───────────────────────────────────────────── */

  const [selectedEmploymentKind, setSelectedEmploymentKind] = useState<
    string[]
  >([])
  const [selectedSalaryFrequency, setSelectedSalaryFrequency] = useState<
    string[]
  >([])
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([])
  const [selectedOmittedAgencies, setSelectedOmittedAgencies] = useState<
    string[]
  >([])
  const [selectedTitleClassification, setSelectedTitleClassification] =
    useState<string[]>([])
  const [selectedCivilServiceTitle, setSelectedCivilServiceTitle] = useState<
    string[]
  >([])
  const [selectedLevel, setSelectedLevel] = useState<string[]>([])
  const [selectedPostingAge, setSelectedPostingAge] = useState<string[]>([])
  const [selectedSalaryFrom, setSelectedSalaryFrom] = useState<string[]>([])

  /* ── Deduplicate jobs by job_id ─────────────────────────────── */

  const uniqueJobs = useMemo(() => {
    const map = new Map<string, NYCJobType>()
    for (const j of jobs) {
      const existing = map.get(j.job_id)
      if (!existing) {
        map.set(j.job_id, j)
        continue
      }
      const jIsExternal = j.posting_type === 'External'
      const eIsExternal = existing.posting_type === 'External'
      if (jIsExternal && !eIsExternal) {
        map.set(j.job_id, j)
      } else if (jIsExternal === eIsExternal) {
        if (new Date(j.posting_updated) > new Date(existing.posting_updated))
          map.set(j.job_id, j)
      }
    }
    return Array.from(map.values())
  }, [jobs])

  // Bundle all current selections into one object for passing to
  // applyFilters and useFilterOptions
  const allSelections: FilterSelections = {
    selectedEmploymentKind,
    selectedSalaryFrequency,
    selectedAgencies,
    selectedOmittedAgencies,
    selectedTitleClassification,
    selectedCivilServiceTitle,
    selectedLevel,
    selectedPostingAge,
    selectedSalaryFrom,
  }

  /* ── Filtered job list ──────────────────────────────────────── */

  const filteredJobs = useMemo(
    () => applyFilters(uniqueJobs, allSelections),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      uniqueJobs,
      selectedEmploymentKind,
      selectedSalaryFrequency,
      selectedAgencies,
      selectedOmittedAgencies,
      selectedTitleClassification,
      selectedCivilServiceTitle,
      selectedLevel,
      selectedPostingAge,
      selectedSalaryFrom,
    ]
  )

  /* ── Filter option lists with faceted counts ────────────────── */

  const filterOptions = useFilterOptions(uniqueJobs, allSelections)

  /* ── Public API ─────────────────────────────────────────────── */

  return {
    filteredJobs,
    uniqueJobs,
    filterState: {
      selectedEmploymentKind,
      setSelectedEmploymentKind,
      selectedSalaryFrequency,
      setSelectedSalaryFrequency,
      selectedAgencies,
      setSelectedAgencies,
      selectedOmittedAgencies,
      setSelectedOmittedAgencies,
      selectedTitleClassification,
      setSelectedTitleClassification,
      selectedCivilServiceTitle,
      setSelectedCivilServiceTitle,
      selectedLevel,
      setSelectedLevel,
      selectedPostingAge,
      setSelectedPostingAge,
      selectedSalaryFrom,
      setSelectedSalaryFrom,
    },
    filterOptions,
  }
}
