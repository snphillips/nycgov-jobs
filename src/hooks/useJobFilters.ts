// hooks/useJobFilters.ts
import { useMemo, useState } from 'react'
import type { NYCJobType } from '../types'
import {
  toK,
  formatDailyLabel,
  formatAnnualLabel,
  formatHourlyLabel,
  toTitleCase,
} from '../utils'

/* ────────────────────────────────────────────────────────────────
   Static groupings / constants
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

/**
 * Bucket a raw salary+frequency into a stable key and human label.
 * Keys look like: "annual:60000-80000", "annual:200000-up",
 *                 "hourly:20-25", "daily:1000-up", etc.
 */
function bucketizeSalary(
  amount: number,
  freq: 'annual' | 'monthly' | 'daily'
): { key: string; label: string } {
  const f = freq.toLowerCase()

  if (f === 'annual') {
    const STEP = 25000
    const CAP = 200000
    const min = Math.floor(amount / STEP) * STEP
    if (amount >= CAP)
      return {
        key: `annual:${CAP}-up`,
        label: formatAnnualLabel(CAP),
      }
    const max = min + STEP
    return {
      // key value shows up as filter pill value in FilterResultsBar
      key: `annual: ${min} - ${max}`,
      label: formatAnnualLabel(min, max),
    }
  }

  if (f === 'hourly') {
    const STEP = 20
    const CAP = 100
    const min = Math.floor(amount / STEP) * STEP
    if (amount >= CAP)
      return {
        key: `hourly:${CAP}-up`,
        label: formatHourlyLabel(CAP),
      }
    const max = min + STEP
    return {
      key: `hourly:${min}-${max}`,
      label: formatHourlyLabel(min, max),
    }
  }

  // default: treat unknown as DAILY
  const STEP = 200
  const CAP = 1000
  const min = Math.floor(amount / STEP) * STEP
  if (amount >= CAP)
    return { key: `daily:${CAP}-up`, label: formatDailyLabel(CAP) }
  const max = min + STEP
  return { key: `daily:${min}-${max}`, label: formatDailyLabel(min, max) }
}

// For sorting buckets nicely in the dropdown
const FREQ_ORDER: Record<string, number> = { annual: 0, hourly: 1, daily: 2 }
function parseBucketKey(key: string) {
  // "annual:60000-80000" or "annual:200000-up"
  const [freq, range] = key.split(':')
  const [startStr, endStr] = range.split('-')
  const start = Number(startStr)
  const isUp = endStr === 'up'
  return { freq, start, isUp }
}

/* ────────────────────────────────────────────────────────────────
   The hook
   ──────────────────────────────────────────────────────────────── */
export function useJobFilters(jobs: NYCJobType[]) {
  // Selected values for each filter group
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
  const [selectedSalaryFrom, setSelectedSalaryFrom] = useState<string[]>([]) // ⟵ NEW

  const now = Date.now()

  /* If you already fetch External + <=6m jobs, you can skip dedupe.
     If not, this dedupes by job_id preferring External, then newer updated. */
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
        if (new Date(j.posting_updated) > new Date(existing.posting_updated)) {
          map.set(j.job_id, j)
        }
      }
    }
    return Array.from(map.values())
  }, [jobs])

  /* ────────────────────────────────────────────────────────────────
     FILTER PREDICATE (uses selected values, including salary buckets)
     ──────────────────────────────────────────────────────────────── */
  const filteredJobs = useMemo(() => {
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

      // Posting age (cumulative buckets)
      if (selectedPostingAge.length > 0) {
        const postingDate = new Date(job.posting_date)
        const ageInDays = (now - postingDate.getTime()) / (1000 * 60 * 60 * 24)
        const matches = selectedPostingAge.some((bucket) => {
          const days = DATE_BUCKETS.find((b) => b.value === bucket)?.days
          if (!days) return false
          return ageInDays <= days
        })
        if (!matches) return false
      }

      // ⟵ NEW: Salary "from" buckets using bucketizeSalary
      if (selectedSalaryFrom.length > 0) {
        const amount = Number(job.salary_range_from)
        const freq = job.salary_frequency
        if (!Number.isFinite(amount) || !freq) return false
        const { key } = bucketizeSalary(amount, freq)
        if (!selectedSalaryFrom.includes(key)) return false
      }

      return true
    })
  }, [
    uniqueJobs,
    now,
    selectedEmploymentKind,
    selectedSalaryFrequency,
    selectedAgencies,
    selectedCivilServiceTitle,
    selectedLevel,
    selectedTitleClassification,
    selectedPostingAge,
    selectedSalaryFrom, // ⟵ include new dependency
  ])

  /* ────────────────────────────────────────────────────────────────
     OPTION LISTS (counts built from uniqueJobs)
     ──────────────────────────────────────────────────────────────── */
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
      .map(([civil_service_title, count]) => ({
        value: civil_service_title,
        label: toTitleCase(civil_service_title),
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

  // Salary "from" options (bucketed)
  const salaryFromOptions = useMemo(() => {
    const counts = new Map<string, number>()
    const labels = new Map<string, string>()

    for (const job of uniqueJobs) {
      const amount = Number(job.salary_range_from)
      const freq = job.salary_frequency
      if (!Number.isFinite(amount) || amount <= 0 || !freq) continue

      const { key, label } = bucketizeSalary(amount, freq)
      counts.set(key, (counts.get(key) ?? 0) + 1)
      if (!labels.has(key)) labels.set(key, label)
    }

    // Sort by frequency group then numeric start of range
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
        value: key, // used in selectedSalaryFrom
        label: labels.get(key)!, // human readable (e.g. "$60k–$80k per year")
        count,
      }))
  }, [uniqueJobs])

  // Posting age options (cumulative)
  const postingAgeOptions = useMemo(() => {
    const counts: Record<string, number> = {
      '1w': 0,
      '2w': 0,
      '3w': 0,
      '1m': 0,
      '6m': 0,
    }
    uniqueJobs.forEach((job) => {
      const date = new Date(job.posting_date)
      const ageInDays = (now - date.getTime()) / (1000 * 60 * 60 * 24)
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
  }, [uniqueJobs, now])

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
