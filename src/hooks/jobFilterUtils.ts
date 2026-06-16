/**
 * jobFilterUtils.ts
 *
 * Pure utility functions for the job filter system.
 * "Pure" means these functions have no side effects and don't use any
 * React hooks — they take inputs and return outputs, nothing else.
 * This makes them easy to test and reason about in isolation.
 */

import type { NYCJobType } from '../types'
import {
  formatDailyLabel,
  formatAnnualLabel,
  formatHourlyLabel,
} from '../utils'
import { type SalaryFreq, type FilterSelections } from '../types'
import {
  VALID_FREQUENCIES,
  NON_EXAM_TITLE_CLASSIFICATION,
  DATE_BUCKETS,
} from '../constants'

/* ────────────────────────────────────────────────────────────────
   Salary frequency validation
   ──────────────────────────────────────────────────────────────── */

/**
 * Type guard that checks whether a string is a valid SalaryFreq.
 * Using a type guard instead of a plain cast means TypeScript will
 * treat the value as SalaryFreq inside any `if (isValidFreq(f))` block.
 */
export function isValidFreq(f: string): f is SalaryFreq {
  return (VALID_FREQUENCIES as readonly string[]).includes(f)
}

/* ────────────────────────────────────────────────────────────────
   Salary bucketing
   ──────────────────────────────────────────────────────────────── */

/**
 * Takes a raw salary amount + frequency and returns a stable bucket key
 * and a human-readable label.
 *
 * Examples:
 *   bucketizeSalary(72000, 'annual') → { key: 'annual:60000-80000', label: '$60k–$80k/yr' }
 *   bucketizeSalary(45, 'hourly')    → { key: 'hourly:40-60',       label: '$40–$60/hr' }
 *
 * The key is used internally to match filter selections to jobs.
 * The label is what the user sees in the dropdown.
 */
export function bucketizeSalary(
  amount: number,
  freq: SalaryFreq
): { key: string; label: string } {
  if (freq === 'annual') {
    const STEP = 25000
    const CAP = 200000
    const min = Math.floor(amount / STEP) * STEP
    if (amount >= CAP)
      return { key: `annual:${CAP}-up`, label: formatAnnualLabel(CAP) }
    const max = min + STEP
    return { key: `annual:${min}-${max}`, label: formatAnnualLabel(min, max) }
  }

  if (freq === 'hourly') {
    const STEP = 20
    const CAP = 100
    const min = Math.floor(amount / STEP) * STEP
    if (amount >= CAP)
      return { key: `hourly:${CAP}-up`, label: formatHourlyLabel(CAP) }
    const max = min + STEP
    return { key: `hourly:${min}-${max}`, label: formatHourlyLabel(min, max) }
  }

  // daily
  const STEP = 200
  const CAP = 1000
  const min = Math.floor(amount / STEP) * STEP
  if (amount >= CAP)
    return { key: `daily:${CAP}-up`, label: formatDailyLabel(CAP) }
  const max = min + STEP
  return { key: `daily:${min}-${max}`, label: formatDailyLabel(min, max) }
}

// TODO: create bucketize function
/**
 * Buckets a raw number_of_positions value into one of three display groups.
 * Examples:
 *   bucketizeNumberPositions(1)  → { key: 'positions:1',     label: '1 position' }
 *   bucketizeNumberPositions(5)  → { key: 'positions:2-10',  label: '2–10 positions' }
 *   bucketizeNumberPositions(15) → { key: 'positions:10-up', label: '10+ positions' }
 */
export function bucketizeNumberPositions(n: number): {
  key: string
  label: string
} {
  if (n === 1) return { key: 'positions:1', label: '1 position' }
  if (n <= 10) return { key: 'positions:2-10', label: '2–10 positions' }
  return { key: 'positions:10-up', label: '10+ positions' }
}
/**
 * Parses a salary bucket key into its component parts for sorting.
 * Example: "annual:60000-80000" → { freq: 'annual', start: 60000, isUp: false }
 */
export function parseBucketKey(key: string) {
  const [freq, range] = key.split(':')
  const [startStr, endStr] = range.split('-')
  return { freq, start: Number(startStr), isUp: endStr === 'up' }
}

/* ────────────────────────────────────────────────────────────────
   Core filter function
   ──────────────────────────────────────────────────────────────── */

/**
 * Applies a set of filter selections to a job list and returns matching jobs.
 *
 * This is the single source of truth for all filter logic. Every filter
 * check in the app ultimately goes through this function.
 *
 * Each filter field is optional — omitting it (or passing an empty array)
 * means that filter is skipped entirely. This design enables faceted counts:
 * useFilterOptions calls applyFilters with one filter zeroed out to get counts
 * that reflect "what would match if the user hadn't selected anything here."
 *
 * Filters are AND-ed: a job must pass every active filter to be included.
 * Within a single filter, selections are OR-ed: selecting 'F' and 'P' shows
 * jobs that are full-time OR part-time.
 *
 * Examples:
 *   applyFilters(jobs, { selectedEmploymentKind: ['F'] })
 *   → only full-time jobs, no other filters applied
 *
 *   applyFilters(jobs, { ...allSelections, selectedTitleClassification: [] })
 *   → all filters applied EXCEPT title classification
 */
export function applyFilters(
  jobs: NYCJobType[],
  filters: FilterSelections
): NYCJobType[] {
  const now = Date.now()
  const {
    selectedEmploymentKind = [],
    selectedSalaryFrequency = [],
    selectedAgencies = [],
    selectedOmittedAgencies = [],
    selectedTitleClassification = [],
    selectedCivilServiceTitle = [],
    selectedLevel = [],
    selectedPostingAge = [],
    selectedSalaryFrom = [],
    selectedNumberPositions = [],
  } = filters

  return jobs.filter((job) => {
    if (
      selectedEmploymentKind.length > 0 &&
      !selectedEmploymentKind.includes(job.full_time_part_time_indicator)
    )
      return false

    if (
      selectedSalaryFrequency.length > 0 &&
      !selectedSalaryFrequency.includes(job.salary_frequency)
    )
      return false

    if (selectedAgencies.length > 0 && !selectedAgencies.includes(job.agency))
      return false
    // exclude agencies
    if (
      selectedOmittedAgencies.length > 0 &&
      selectedOmittedAgencies.includes(job.agency)
    )
      return false

    if (
      selectedCivilServiceTitle.length > 0 &&
      !selectedCivilServiceTitle.includes(job.civil_service_title)
    )
      return false

    if (selectedLevel.length > 0 && !selectedLevel.includes(job.level))
      return false

    if (
      selectedTitleClassification.length > 0 &&
      !(
        selectedTitleClassification.includes(job.title_classification) ||
        (selectedTitleClassification.includes('no-exam') &&
          NON_EXAM_TITLE_CLASSIFICATION.includes(job.title_classification))
      )
    )
      return false

    if (selectedPostingAge.length > 0) {
      const ageInDays =
        (now - new Date(job.posting_date).getTime()) / (1000 * 60 * 60 * 24)
      const matches = selectedPostingAge.some((bucket) => {
        const days = DATE_BUCKETS.find((b) => b.value === bucket)?.days
        return days != null && ageInDays <= days
      })
      if (!matches) return false
    }

    if (selectedSalaryFrom.length > 0) {
      const amount = Number(job.salary_range_from)
      const freq = job.salary_frequency?.toLowerCase()
      if (!Number.isFinite(amount) || !freq || !isValidFreq(freq)) return false
      const { key } = bucketizeSalary(amount, freq)
      if (!selectedSalaryFrom.includes(key)) return false
    }
    // TODO: fix this to filter corrected
    // At the bottom of the .filter() callback, before `return true`:
    if (selectedNumberPositions.length > 0) {
      const n = Number(job.number_of_positions)
      if (!Number.isFinite(n) || n <= 0) return false
      const { key } = bucketizeNumberPositions(n)
      if (!selectedNumberPositions.includes(key)) return false
    }

    return true
  })
}
