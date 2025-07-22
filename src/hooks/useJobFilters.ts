import { useMemo, useState } from 'react'
import type { NYCJobType } from '../types'
import { toTitleCase } from '../utils'

const NON_EXAM_CLASSES = [
  'Pending Classification-2',
  'Labor-3',
  'Exempt-4',
  'Non-Competitive-5',
]

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
  const [selectedPostingType, setSelectedPostingType] = useState<string[]>([])

  const uniqueJobs = useMemo(() => {
    const map = new Map<string, NYCJobType>()
    jobs.forEach((job) => {
      const existing = map.get(job.job_id)
      if (!existing) {
        map.set(job.job_id, job)
      } else {
        const currentIsExternal = job.posting_type === 'External'
        const existingIsExternal = existing.posting_type === 'External'

        if (currentIsExternal && !existingIsExternal) {
          map.set(job.job_id, job)
        } else if (currentIsExternal === existingIsExternal) {
          const isNewer =
            new Date(job.posting_updated) > new Date(existing.posting_updated)
          if (isNewer) {
            map.set(job.job_id, job)
          }
        }
      }
    })
    return Array.from(map.values())
  }, [jobs])

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
        selectedPostingType.length > 0 &&
        !selectedPostingType.includes(job.posting_type)
      )
        return false

      if (
        selectedTitleClassification.length > 0 &&
        !(
          selectedTitleClassification.includes(job.title_classification) ||
          (selectedTitleClassification.includes('no-exam') &&
            NON_EXAM_CLASSES.includes(job.title_classification))
        )
      )
        return false

      return true
    })
  }, [
    uniqueJobs,
    selectedEmploymentKind,
    selectedSalaryFrequency,
    selectedAgencies,
    selectedPostingType,
    selectedTitleClassification,
  ])

  const employmentKindOptions = useMemo(() => {
    const map: Record<string, number> = {}
    uniqueJobs.forEach((job) => {
      map[job.full_time_part_time_indicator] =
        (map[job.full_time_part_time_indicator] || 0) + 1
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
      map[job.salary_frequency] = (map[job.salary_frequency] || 0) + 1
    })
    return ['Annual', 'Hourly', 'Daily'].map((freq) => ({
      value: freq,
      label: freq,
      count: map[freq] || 0,
    }))
  }, [uniqueJobs])

  const postingTypeOptions = useMemo(() => {
    const map: Record<string, number> = {}
    uniqueJobs.forEach((job) => {
      map[job.posting_type] = (map[job.posting_type] || 0) + 1
    })
    return ['Internal', 'External'].map((pt) => ({
      value: pt,
      label: pt,
      count: map[pt] || 0,
    }))
  }, [uniqueJobs])

  const titleClassificationOptions = useMemo(() => {
    let examCount = 0
    let noExamCount = 0
    uniqueJobs.forEach((job) => {
      if (job.title_classification === 'Competitive-1') examCount++
      else if (NON_EXAM_CLASSES.includes(job.title_classification))
        noExamCount++
    })
    return [
      { value: 'Competitive-1', label: 'Yes', count: examCount },
      { value: 'no-exam', label: 'No', count: noExamCount },
    ]
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
      selectedPostingType,
      setSelectedPostingType,
    },
    filterOptions: {
      employmentKindOptions,
      salaryFrequencyOptions,
      agencyFilterOptions,
      postingTypeOptions,
      titleClassificationOptions,
    },
  }
}
