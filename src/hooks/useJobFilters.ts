import { useMemo, useState } from 'react'
import type { NYCJobType } from '../types'
import {
  formatDailyLabel,
  formatAnnualLabel,
  formatHourlyLabel,
  toTitleCase,
} from '../utils'

/**
 * useJobFilters
 *
 * This hook is the brain of the job filtering system. It takes the raw list
 * of jobs fetched from the NYC API and returns:
 *
 *   1. `filteredJobs`  — the jobs that match ALL currently selected filters
 *   2. `filterState`   — the selected values for each filter + their setters
 *   3. `filterOptions` — the available choices for each filter dropdown,
 *                        with job counts so the UI can show e.g. "Full-Time (142)"
 *
 * Filters are AND-ed together (a job must pass every active filter to appear).
 * Within a single filter, selections are OR-ed (selecting "Annual" and "Hourly"
 * shows jobs that are either annual OR hourly).
 *
 * Salary ranges are "bucketed" — instead of showing every possible salary,
 * jobs are grouped into ranges like "$60k–$80k/yr" for a cleaner UI.
 *
 * Junior Dev note: most of the logic lives inside `useMemo` blocks. This means
 * the expensive filtering/counting only re-runs when its inputs actually change,
 * not on every render.
 */

/* ────────────────────────────────────────────────────────────────
   Constants
   ──────────────────────────────────────────────────────────────── */

const NON_EXAM_TITLE_CLASSIFICATION = [
  'Pending Classification-2',
  'Labor-3',
  'Exempt-4',
  'Non-Competitive-5',
]

const DATE_BUCKETS = [
  { value: '1w', label: 'Past week', days: 7 },
  { value: '2w', label: 'Past 2 weeks', days: 14 },
  { value: '3w', label: 'Past 3 weeks', days: 21 },
  { value: '1m', label: 'Past month', days: 30 },
  { value: '6m', label: 'Past 6 months', days: 183 },
]

// Used to sort salary buckets: annual first, then hourly, then daily
const FREQ_ORDER: Record<string, number> = { annual: 0, hourly: 1, daily: 2 }

// Valid salary frequency values from the API
const VALID_FREQS = ['annual', 'hourly', 'daily'] as const
type SalaryFreq = (typeof VALID_FREQS)[number]

function isValidFreq(f: string): f is SalaryFreq {
  return (VALID_FREQS as readonly string[]).includes(f)
}

/* ────────────────────────────────────────────────────────────────
   Salary bucketing helpers
   ──────────────────────────────────────────────────────────────── */

/**
 * Takes a raw salary amount + frequency and returns a stable bucket key
 * and a human-readable label. For example:
 *   bucketizeSalary(72000, 'annual') → { key: 'annual:60000-80000', label: '$60k–$80k/yr' }
 *
 * The key is used internally to match filter selections.
 * The label is what the user sees in the dropdown.
 */
function bucketizeSalary(
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

/** Parses "annual:60000-80000" into { freq: 'annual', start: 60000, isUp: false } */
function parseBucketKey(key: string) {
  const [freq, range] = key.split(':')
  const [startStr, endStr] = range.split('-')
  return { freq, start: Number(startStr), isUp: endStr === 'up' }
}

/* ────────────────────────────────────────────────────────────────
   The hook
   ──────────────────────────────────────────────────────────────── */
export function useJobFilters(jobs: NYCJobType[]) {
  const [selectedEmploymentKind, setSelectedEmploymentKind] = useState<
    string[]
  >([])
  const [selectedSalaryFrequency, setSelectedSalaryFrequency] = useState<
    string[]
  >([])
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([])
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

  /* ── Apply all active filters ───────────────────────────────── */
  const filteredJobs = useMemo(() => {
    // Snapshot now inside the memo so it doesn't invalidate on every render
    const now = Date.now()

    return uniqueJobs.filter((job) => {
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
        if (!Number.isFinite(amount) || !freq || !isValidFreq(freq))
          return false
        const { key } = bucketizeSalary(amount, freq)
        if (!selectedSalaryFrom.includes(key)) return false
      }

      return true
    })
  }, [
    uniqueJobs,
    selectedEmploymentKind,
    selectedSalaryFrequency,
    selectedAgencies,
    selectedCivilServiceTitle,
    selectedLevel,
    selectedTitleClassification,
    selectedPostingAge,
    selectedSalaryFrom,
  ])

  /* ── Build filter option lists with counts ──────────────────── */

  const employmentKindOptions = useMemo(() => {
    const map: Record<string, number> = {}
    uniqueJobs.forEach((job) => {
      const k = job.full_time_part_time_indicator
      map[k] = (map[k] || 0) + 1
    })
    return [
      { value: 'F', label: 'Full-Time', count: map['F'] || 0 },
      { value: 'P', label: 'Part-Time', count: map['P'] || 0 },
    ]
  }, [uniqueJobs])

  const agencyFilterOptions = useMemo(() => {
    const counts: Record<string, number> = {}
    uniqueJobs.forEach((job) => {
      if (job.agency) counts[job.agency] = (counts[job.agency] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([agency, count]) => ({
        value: agency,
        label: toTitleCase(agency),
        count,
      }))
  }, [uniqueJobs])

  const salaryFrequencyOptions = useMemo(() => {
    const map: Record<string, number> = {}
    uniqueJobs.forEach((job) => {
      const k = job.salary_frequency
      map[k] = (map[k] || 0) + 1
    })
    return ['Annual', 'Hourly', 'Daily'].map((freq) => ({
      value: freq,
      label: freq,
      count: map[freq] || 0,
    }))
  }, [uniqueJobs])

  const examTitleClassificationOptions = useMemo(() => {
    let examCount = 0
    let noExamCount = 0
    uniqueJobs.forEach((job) => {
      if (job.title_classification === 'Competitive-1') examCount++
      else if (NON_EXAM_TITLE_CLASSIFICATION.includes(job.title_classification))
        noExamCount++
    })
    return [
      { value: 'Competitive-1', label: 'Yes', count: examCount },
      { value: 'no-exam', label: 'No', count: noExamCount },
    ]
  }, [uniqueJobs])

  const civilServiceTitleOptions = useMemo(() => {
    const counts: Record<string, number> = {}
    uniqueJobs.forEach((job) => {
      if (job.civil_service_title)
        counts[job.civil_service_title] =
          (counts[job.civil_service_title] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, count]) => ({
        value: title,
        label: toTitleCase(title),
        count,
      }))
  }, [uniqueJobs])

  const levelOptions = useMemo(() => {
    const counts: Record<string, number> = {}
    uniqueJobs.forEach((job) => {
      if (job.level) counts[job.level] = (counts[job.level] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([level, count]) => ({
        value: level,
        label: toTitleCase(level),
        count,
      }))
  }, [uniqueJobs])

  const salaryFromOptions = useMemo(() => {
    const counts = new Map<string, number>()
    const labels = new Map<string, string>()
    for (const job of uniqueJobs) {
      const amount = Number(job.salary_range_from)
      const freq = job.salary_frequency?.toLowerCase()
      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !freq ||
        !isValidFreq(freq)
      )
        continue
      const { key, label } = bucketizeSalary(amount, freq)
      counts.set(key, (counts.get(key) ?? 0) + 1)
      if (!labels.has(key)) labels.set(key, label)
    }
    return Array.from(counts.entries())
      .sort(([ka], [kb]) => {
        const A = parseBucketKey(ka)
        const B = parseBucketKey(kb)
        const aOrder = FREQ_ORDER[A.freq] ?? 99
        const bOrder = FREQ_ORDER[B.freq] ?? 99
        if (aOrder !== bOrder) return aOrder - bOrder
        return A.start - B.start
      })
      .map(([key, count]) => ({
        value: key,
        label: labels.get(key)!,
        count,
      }))
  }, [uniqueJobs])

  const postingAgeOptions = useMemo(() => {
    const now = Date.now()
    const counts: Record<string, number> = {
      '1w': 0,
      '2w': 0,
      '3w': 0,
      '1m': 0,
      '6m': 0,
    }
    uniqueJobs.forEach((job) => {
      const ageInDays =
        (now - new Date(job.posting_date).getTime()) / (1000 * 60 * 60 * 24)
      if (ageInDays <= 7) counts['1w']++
      if (ageInDays <= 14) counts['2w']++
      if (ageInDays <= 21) counts['3w']++
      if (ageInDays <= 30) counts['1m']++
      if (ageInDays <= 183) counts['6m']++
    })
    return DATE_BUCKETS.map(({ value, label }) => ({
      value,
      label,
      count: counts[value],
    }))
  }, [uniqueJobs])

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
    filterOptions: {
      employmentKindOptions,
      salaryFrequencyOptions,
      agencyFilterOptions,
      examTitleClassificationOptions,
      civilServiceTitleOptions,
      levelOptions,
      postingAgeOptions,
      salaryFromOptions,
    },
  }
}
