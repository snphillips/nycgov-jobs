// TODO: delete thins once filter refactor is complete.
// Let's keep all types in ../types

/**
 * jobFilterTypes.ts
 *
 * Shared types, interfaces, and constants used across the job filter system.
 * Keeping these in one place means adding a new filter type only requires
 * changes here and in the files that use it — nothing is scattered.
 */

// /* ────────────────────────────────────────────────────────────────
//    Constants
//    ──────────────────────────────────────────────────────────────── */

// // Title classifications that do NOT require a civil service exam
// export const NON_EXAM_TITLE_CLASSIFICATION = [
//   'Pending Classification-2',
//   'Labor-3',
//   'Exempt-4',
//   'Non-Competitive-5',
// ]

// // Predefined posting age buckets shown in the "Date Posted Within" filter
// export const DATE_BUCKETS = [
//   { value: '1w', label: 'Past week', days: 7 },
//   { value: '2w', label: 'Past 2 weeks', days: 14 },
//   { value: '3w', label: 'Past 3 weeks', days: 21 },
//   { value: '1m', label: 'Past month', days: 30 },
//   { value: '6m', label: 'Past 6 months', days: 183 },
// ]

// // Controls the sort order of salary buckets in the dropdown
// export const FREQ_ORDER: Record<string, number> = {
//   annual: 0,
//   hourly: 1,
//   daily: 2,
// }

// // The only salary frequency values the NYC API produces
// export const VALID_FREQUENCIES = ['annual', 'hourly', 'daily'] as const

// /* ────────────────────────────────────────────────────────────────
//    Types
//    ──────────────────────────────────────────────────────────────── */

// export type SalaryFreq = (typeof VALID_FREQUENCIES)[number]

// TODO - delete once migrate to types.ts is complete
// /**
//  * Represents all active filter selections.
//  *
//  * Every field is optional so applyFilters can be called with a subset
//  * of filters — this is what enables faceted counts (counting against
//  * all filters except one).
//  */
// export interface FilterSelections {
//   selectedEmploymentKind?: string[]
//   selectedSalaryFrequency?: string[]
//   selectedAgencies?: string[]
//   selectedTitleClassification?: string[]
//   selectedCivilServiceTitle?: string[]
//   selectedLevel?: string[]
//   selectedPostingAge?: string[]
//   selectedSalaryFrom?: string[]
// }
