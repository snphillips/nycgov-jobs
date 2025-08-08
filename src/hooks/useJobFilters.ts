import { useMemo, useState } from 'react'
import type { NYCJobType } from '../types'
import { toTitleCase } from '../utils'

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

export function useJobFilters(jobs: NYCJobType[]) {
  const [selectedEmploymentKind, setSelectedEmploymentKind] = useState<
    string[]
  >([])
  const [selectedSalaryFrequency, setSelectedSalaryFrequency] = useState<
    string[]
  >([])
  const [selectedPostingAge, setSelectedPostingAge] = useState<string[]>([])
  const [selectedTitleClassification, setSelectedTitleClassification] =
    useState<string[]>([])
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([])
  const [selectedCivilServiceTitle, setSelectedCivilServiceTitle] = useState<
    string[]
  >([])
  const [selectedLevel, setSelectedLevel] = useState<string[]>([])

  const now = Date.now()

  // Deduplicate rows that share the same job_id
  const uniqueJobs = useMemo(() => {
    const map = new Map<string, NYCJobType>()

    jobs.forEach((j) => {
      const existing = map.get(j.job_id)

      if (!existing) {
        map.set(j.job_id, j)
      } else {
        const jIsExternal = j.posting_type === 'External'
        const existingIsExternal = existing.posting_type === 'External'

        // Prefer external postings
        if (jIsExternal && !existingIsExternal) {
          map.set(j.job_id, j)
        } else if (jIsExternal === existingIsExternal) {
          // If both are same type, keep the most recently updated
          const existingDate = new Date(existing.posting_updated)
          const newDate = new Date(j.posting_updated)
          if (newDate > existingDate) {
            map.set(j.job_id, j)
          }
        }
      }
    })

    return Array.from(map.values())
  }, [jobs])

  const filteredJobs = useMemo(() => {
    const employmentKindSet = new Set(selectedEmploymentKind)
    const salaryFrequencySet = new Set(selectedSalaryFrequency)
    const agencySet = new Set(selectedAgencies)
    const civilServiceTitleSet = new Set(selectedCivilServiceTitle)
    const levelSet = new Set(selectedLevel)
    const titleClassificationSet = new Set(selectedTitleClassification)
    const postingAgeSet = new Set(selectedPostingAge)

    const dateBucketMap = DATE_BUCKETS.reduce(
      (acc, b) => {
        acc[b.value] = b.days
        return acc
      },
      {} as Record<string, number>
    )

    return uniqueJobs.filter((job) => {
      if (
        employmentKindSet.size > 0 &&
        !employmentKindSet.has(job.full_time_part_time_indicator)
      )
        return false

      if (
        salaryFrequencySet.size > 0 &&
        !salaryFrequencySet.has(job.salary_frequency)
      )
        return false

      if (agencySet.size > 0 && !agencySet.has(job.agency)) return false

      if (
        civilServiceTitleSet.size > 0 &&
        !civilServiceTitleSet.has(job.civil_service_title)
      )
        return false

      if (levelSet.size > 0 && !levelSet.has(job.level)) return false

      if (
        titleClassificationSet.size > 0 &&
        !(
          titleClassificationSet.has(job.title_classification) ||
          (titleClassificationSet.has('no-exam') &&
            NON_EXAM_TITLE_CLASSIFICATION.includes(job.title_classification))
        )
      )
        return false

      if (postingAgeSet.size > 0) {
        const postingDate = new Date(job.posting_date)
        const ageInDays = (now - postingDate.getTime()) / (1000 * 60 * 60 * 24)

        const matches = Array.from(postingAgeSet).some((bucket) => {
          const days = dateBucketMap[bucket]
          return days ? ageInDays <= days : false
        })

        if (!matches) return false
      }

      return true
    })
  }, [
    selectedEmploymentKind,
    selectedSalaryFrequency,
    selectedAgencies,
    selectedCivilServiceTitle,
    selectedLevel,
    selectedPostingAge,
    selectedTitleClassification,
    now,
    uniqueJobs,
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
    jobs,
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
    },
    filterOptions: {
      employmentKindOptions,
      salaryFrequencyOptions,
      agencyFilterOptions,
      postingTypeOptions,
      examTitleClassificationOptions,
      civilServiceTitleOptions,
      levelOptions,
      postingAgeOptions,
    },
  }
}
