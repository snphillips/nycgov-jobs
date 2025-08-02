export interface NYCJobType {
  job_id: string
  agency: string
  posting_type: string
  number_of_positions: string
  business_title: string
  civil_service_title: string
  title_classification: string // “Competitive-1”, “Non-Competitive”, …
  title_code_no: string
  level: string // “M3”, “IIA”, …
  job_category: string
  full_time_part_time_indicator: 'F' | 'P'
  career_level: string // “Manager”, “Entry-Level”, …
  salary_range_from: string
  salary_range_to: string
  salary_frequency: string // “Annual”, “Hourly”
  work_location: string
  division_work_unit: string
  job_description: string
  preferred_skills?: string
  additional_information?: string
  minimum_qual_requirements: string
  to_apply?: string
  hours_shift?: string
  work_location_1?: string
  residency_requirement: string
  posting_date: string // ISO – e.g. “2024-06-13T00:00:00.000”
  post_until?: string
  posting_updated: string
  process_date: string
}
