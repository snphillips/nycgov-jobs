/**
 * useFilterOptions.ts
 *
 * Builds the option lists (with live counts) for every filter dropdown.
 *
 * The counts are "faceted" — each filter's counts reflect the jobs that
 * would match if only the OTHER filters were active. This means:
 *
 *   - Selecting "Part-Time" updates the counts in every other filter
 *     to show how many part-time jobs match each option there
 *   - A filter's own selection never collapses its own counts to zero,
 *     so the user can always see and change what they've selected
 *
 * Junior Dev note: each `jobsForX` memo applies all filters EXCEPT filter X.
 * The corresponding option list then counts against that subset.
 * This is the standard pattern for faceted search UIs.
 */

import { useMemo } from 'react'
import type { NYCJobType } from '../types'
import { toTitleCase } from '../utils'
import {
  DATE_BUCKETS,
  FREQ_ORDER,
  NON_EXAM_TITLE_CLASSIFICATION,
} from '../constants'
import type { FilterSelections } from '../types'
import {
  applyFilters,
  bucketizeSalary,
  isValidFreq,
  parseBucketKey,
  bucketizeNumberPositions,
} from './jobFilterUtils'

export function useFilterOptions(
  uniqueJobs: NYCJobType[],
  allSelections: FilterSelections
) {
  /* ── Faceted job subsets ────────────────────────────────────────
     One per filter group. Each applies all filters except its own,
     so the counts for that group reflect the rest of the active filters.
     ──────────────────────────────────────────────────────────────── */

  const jobsForEmploymentKind = useMemo(
    () =>
      applyFilters(uniqueJobs, {
        ...allSelections,
        selectedEmploymentKind: [],
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      uniqueJobs,
      allSelections.selectedSalaryFrequency,
      allSelections.selectedAgencies,
      allSelections.selectedTitleClassification,
      allSelections.selectedCivilServiceTitle,
      allSelections.selectedLevel,
      allSelections.selectedPostingAge,
      allSelections.selectedSalaryFrom,
      allSelections.selectedNumberPositions,
    ]
  )

  const jobsForSalaryFrequency = useMemo(
    () =>
      applyFilters(uniqueJobs, {
        ...allSelections,
        selectedSalaryFrequency: [],
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      uniqueJobs,
      allSelections.selectedEmploymentKind,
      allSelections.selectedAgencies,
      allSelections.selectedTitleClassification,
      allSelections.selectedCivilServiceTitle,
      allSelections.selectedLevel,
      allSelections.selectedPostingAge,
      allSelections.selectedSalaryFrom,
      allSelections.selectedNumberPositions,
    ]
  )

  const jobsForAgencies = useMemo(
    () => applyFilters(uniqueJobs, { ...allSelections, selectedAgencies: [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      uniqueJobs,
      allSelections.selectedEmploymentKind,
      allSelections.selectedSalaryFrequency,
      allSelections.selectedTitleClassification,
      allSelections.selectedCivilServiceTitle,
      allSelections.selectedLevel,
      allSelections.selectedPostingAge,
      allSelections.selectedSalaryFrom,
      allSelections.selectedOmittedAgencies,
      allSelections.selectedNumberPositions,
    ]
  )

  const jobsForOmittedAgencies = useMemo(
    () => applyFilters(uniqueJobs, { ...allSelections, selectedAgencies: [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      uniqueJobs,
      allSelections.selectedEmploymentKind,
      allSelections.selectedSalaryFrequency,
      allSelections.selectedTitleClassification,
      allSelections.selectedCivilServiceTitle,
      allSelections.selectedLevel,
      allSelections.selectedPostingAge,
      allSelections.selectedSalaryFrom,
      allSelections.selectedAgencies,
      allSelections.selectedNumberPositions,
    ]
  )

  const jobsForTitleClassification = useMemo(
    () =>
      applyFilters(uniqueJobs, {
        ...allSelections,
        selectedTitleClassification: [],
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      uniqueJobs,
      allSelections.selectedEmploymentKind,
      allSelections.selectedSalaryFrequency,
      allSelections.selectedAgencies,
      allSelections.selectedCivilServiceTitle,
      allSelections.selectedLevel,
      allSelections.selectedPostingAge,
      allSelections.selectedSalaryFrom,
      allSelections.selectedNumberPositions,
    ]
  )

  const jobsForCivilServiceTitle = useMemo(
    () =>
      applyFilters(uniqueJobs, {
        ...allSelections,
        selectedCivilServiceTitle: [],
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      uniqueJobs,
      allSelections.selectedEmploymentKind,
      allSelections.selectedSalaryFrequency,
      allSelections.selectedAgencies,
      allSelections.selectedTitleClassification,
      allSelections.selectedLevel,
      allSelections.selectedPostingAge,
      allSelections.selectedSalaryFrom,
      allSelections.selectedNumberPositions,
    ]
  )

  const jobsForLevel = useMemo(
    () => applyFilters(uniqueJobs, { ...allSelections, selectedLevel: [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      uniqueJobs,
      allSelections.selectedEmploymentKind,
      allSelections.selectedSalaryFrequency,
      allSelections.selectedAgencies,
      allSelections.selectedTitleClassification,
      allSelections.selectedCivilServiceTitle,
      allSelections.selectedPostingAge,
      allSelections.selectedSalaryFrom,
      allSelections.selectedNumberPositions,
    ]
  )

  const jobsForPostingAge = useMemo(
    () =>
      applyFilters(uniqueJobs, { ...allSelections, selectedPostingAge: [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      uniqueJobs,
      allSelections.selectedEmploymentKind,
      allSelections.selectedSalaryFrequency,
      allSelections.selectedAgencies,
      allSelections.selectedTitleClassification,
      allSelections.selectedCivilServiceTitle,
      allSelections.selectedLevel,
      allSelections.selectedSalaryFrom,
      allSelections.selectedNumberPositions,
    ]
  )

  const jobsForSalaryFrom = useMemo(
    () =>
      applyFilters(uniqueJobs, { ...allSelections, selectedSalaryFrom: [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      uniqueJobs,
      allSelections.selectedEmploymentKind,
      allSelections.selectedSalaryFrequency,
      allSelections.selectedAgencies,
      allSelections.selectedTitleClassification,
      allSelections.selectedCivilServiceTitle,
      allSelections.selectedLevel,
      allSelections.selectedPostingAge,
      allSelections.selectedNumberPositions,
    ]
  )

  const jobsForNumberPositions = useMemo(
    () =>
      applyFilters(uniqueJobs, {
        ...allSelections,
        selectedNumberPositions: [],
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      uniqueJobs,
      allSelections.selectedEmploymentKind,
      allSelections.selectedSalaryFrequency,
      allSelections.selectedAgencies,
      allSelections.selectedTitleClassification,
      allSelections.selectedCivilServiceTitle,
      allSelections.selectedLevel,
      allSelections.selectedPostingAge,
      allSelections.selectedSalaryFrom,
    ]
  )

  /* ── Option lists with faceted counts ──────────────────────────
     Each list is built from its corresponding jobsForX subset above.
     ──────────────────────────────────────────────────────────────── */

  const employmentKindOptions = useMemo(() => {
    const map: Record<string, number> = {}
    jobsForEmploymentKind.forEach((job) => {
      const k = job.full_time_part_time_indicator
      map[k] = (map[k] || 0) + 1
    })
    return [
      { value: 'F', label: 'Full-Time', count: map['F'] || 0 },
      { value: 'P', label: 'Part-Time', count: map['P'] || 0 },
    ]
  }, [jobsForEmploymentKind])

  const salaryFrequencyOptions = useMemo(() => {
    const map: Record<string, number> = {}
    jobsForSalaryFrequency.forEach((job) => {
      const k = job.salary_frequency
      map[k] = (map[k] || 0) + 1
    })
    return ['Annual', 'Hourly', 'Daily'].map((freq) => ({
      value: freq,
      label: freq,
      count: map[freq] || 0,
    }))
  }, [jobsForSalaryFrequency])

  const agenciesFilterOptions = useMemo(() => {
    const counts: Record<string, number> = {}
    jobsForAgencies.forEach((job) => {
      if (job.agency) counts[job.agency] = (counts[job.agency] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([agency, count]) => ({
        value: agency,
        label: toTitleCase(agency),
        count,
      }))
  }, [jobsForAgencies])
  // ================================
  const omittedAgenciesFilterOptions = useMemo(() => {
    const counts: Record<string, number> = {}
    jobsForOmittedAgencies.forEach((job) => {
      if (job.agency) counts[job.agency] = (counts[job.agency] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([agency, count]) => ({
        value: agency,
        label: toTitleCase(agency),
        count,
      }))
  }, [jobsForOmittedAgencies])
  // ================================

  const examTitleClassificationOptions = useMemo(() => {
    let examCount = 0
    let noExamCount = 0
    jobsForTitleClassification.forEach((job) => {
      if (job.title_classification === 'Competitive-1') examCount++
      else if (NON_EXAM_TITLE_CLASSIFICATION.includes(job.title_classification))
        noExamCount++
    })
    return [
      { value: 'Competitive-1', label: 'Yes', count: examCount },
      { value: 'no-exam', label: 'No', count: noExamCount },
    ]
  }, [jobsForTitleClassification])

  const civilServiceTitleOptions = useMemo(() => {
    const counts: Record<string, number> = {}
    jobsForCivilServiceTitle.forEach((job) => {
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
  }, [jobsForCivilServiceTitle])

  const levelOptions = useMemo(() => {
    const counts: Record<string, number> = {}
    jobsForLevel.forEach((job) => {
      if (job.level) counts[job.level] = (counts[job.level] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([level, count]) => ({
        value: level,
        label: toTitleCase(level),
        count,
      }))
  }, [jobsForLevel])

  const salaryFromOptions = useMemo(() => {
    const counts = new Map<string, number>()
    const labels = new Map<string, string>()
    for (const job of jobsForSalaryFrom) {
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
  }, [jobsForSalaryFrom])

  const postingAgeOptions = useMemo(() => {
    const now = Date.now()
    const counts: Record<string, number> = {
      '1w': 0,
      '2w': 0,
      '3w': 0,
      '1m': 0,
      '6m': 0,
    }
    jobsForPostingAge.forEach((job) => {
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
  }, [jobsForPostingAge])

  const numberPositionsOptions = useMemo(() => {
    // keep for debugging
    // console.log(
    //   'sample number_of_positions values:',
    //   jobsForNumberPositions.slice(0, 5).map((j) => ({
    //     raw: j.number_of_positions,
    //     coerced: Number(j.number_of_positions),
    //   }))
    // )
    const counts: Record<string, number> = {
      'positions:1': 0,
      'positions:2-10': 0,
      'positions:10-up': 0,
    }
    for (const job of jobsForNumberPositions) {
      const n = Number(job.number_of_positions)
      if (!Number.isFinite(n) || n <= 0) continue
      const { key } = bucketizeNumberPositions(n)
      counts[key] = (counts[key] ?? 0) + 1
    }
    return [
      {
        value: 'positions:1',
        label: '1 position',
        count: counts['positions:1'],
      },
      {
        value: 'positions:2-10',
        label: '2–10 positions',
        count: counts['positions:2-10'],
      },
      {
        value: 'positions:10-up',
        label: '10+ positions',
        count: counts['positions:10-up'],
      },
    ]
  }, [jobsForNumberPositions])

  return {
    employmentKindOptions,
    salaryFrequencyOptions,
    agenciesFilterOptions,
    omittedAgenciesFilterOptions,
    examTitleClassificationOptions,
    civilServiceTitleOptions,
    levelOptions,
    postingAgeOptions,
    salaryFromOptions,
    numberPositionsOptions,
  }
}
