// Title classifications that do NOT require a civil service exam
export const NON_EXAM_TITLE_CLASSIFICATION = [
  'Pending Classification-2',
  'Labor-3',
  'Exempt-4',
  'Non-Competitive-5',
]

// Predefined posting age buckets shown in the "Date Posted Within" filter
export const DATE_BUCKETS = [
  { value: '1w', label: 'Past week', days: 7 },
  { value: '2w', label: 'Past 2 weeks', days: 14 },
  { value: '3w', label: 'Past 3 weeks', days: 21 },
  { value: '1m', label: 'Past month', days: 30 },
  { value: '6m', label: 'Past 6 months', days: 183 },
]

// Controls the sort order of salary buckets in the dropdown
export const FREQ_ORDER: Record<string, number> = {
  annual: 0,
  hourly: 1,
  daily: 2,
}

// The only salary frequency values the NYC API produces
export const VALID_FREQUENCIES = ['annual', 'hourly', 'daily'] as const
