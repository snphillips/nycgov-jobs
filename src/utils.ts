import type { NYCJobType } from './types'

export function toTitleCase(input: string) {
  return input
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// The app is interprets characters with the wrong encoding
// This occurs when the original text was encoded as UTF-8,
// but is being interpreted or displayed as ISO-8859-1 (Latin-1)
// or Windows-1252
export function cleanText(text: string): string {
  return text
    .replace(/â¢/g, '\n• ') // newline + bullet point
    .replace(/â/g, '’') // right single quote
    .replace(/â/g, '“') // left double quote
    .replace(/â/g, '”') // right double quote
    .replace(/â”/g, '—') // em dash
    .replace(/â¦/g, '…') // ellipsis
    .replace(/â/g, `'`) // fallback apostrophe
    .replace(/(\d+\.)\s*/g, '\n$1 ') // ← key line: adds a line break before 1. 2. etc.
}

export function isInternalJob(job: NYCJobType): boolean {
  const combinedText = [
    job.job_description,
    job.additional_information,
    job.to_apply,
  ]
    .join(' ')
    .toLowerCase()

  const internalRegex =
    /open\s+to\s+.*?\s+employees\s+only|for\s+.*?\s+employees\s+only|only\s+permanent\s+employees\s+in\s+the\s+title|open\s+to\s+current\s+employees\s+only|restricted\s+to\s+.*?\s+employees/
  return internalRegex.test(combinedText)
}

export const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export const currencyFormatter = (amount: number): string => {
  return usdFormatter.format(amount)
}

// Format a salary range with frequency
export const formatSalaryRangeFrequency = (
  from: string,
  to: string,
  freq: string
): string => {
  return `${currencyFormatter(Number(from))} – ${currencyFormatter(Number(to))} ${freq}`
}

export const toK = (n: number) => `${Math.round(n / 1000)}k`
export const formatAnnualLabel = (min: number, max?: number) =>
  max == null ? `$${toK(min)}+ per year` : `$${toK(min)}–$${toK(max)} per year`

export const formatHourlyLabel = (min: number, max?: number) =>
  max == null ? `$${min}+ per hour` : `$${min}–$${max} per hour`

export const formatDailyLabel = (min: number, max?: number) =>
  max == null ? `$${min}+ per day` : `$${min}–$${max} per day`

/**
 * Return a stable key + human label for a given salary+frequency.
 * Keys are used for filtering; labels are for display.
 */
export function bucketizeSalary(
  amount: number,
  freq: string
): {
  key: string // e.g. "annual:60000-80000"
  label: string // e.g. "$60k–$80k per year"
} {
  const frequency = freq.toLowerCase()

  if (frequency === 'annual') {
    const step = 20000
    const cap = 200000
    const min = Math.floor(amount / step) * step
    if (amount >= cap) {
      return { key: `annual:${cap}-up`, label: formatAnnualLabel(cap) }
    }
    const max = min + step
    return { key: `annual:${min}-${max}`, label: formatAnnualLabel(min, max) }
  }

  if (frequency === 'hourly') {
    const step = 5
    const cap = 100
    const min = Math.floor(amount / step) * step
    if (amount >= cap) {
      return { key: `hourly:${cap}-up`, label: formatHourlyLabel(cap) }
    }
    const max = min + step
    return { key: `hourly:${min}-${max}`, label: formatHourlyLabel(min, max) }
  }

  // default to DAILY
  const dailyWageStep = 50
  const dailyWageCap = 1000
  const min = Math.floor(amount / dailyWageStep) * dailyWageStep
  if (amount >= dailyWageCap) {
    return {
      key: `daily:${dailyWageCap}-up`,
      label: formatDailyLabel(dailyWageCap),
    }
  }
  const max = min + dailyWageStep
  return { key: `daily:${min}-${max}`, label: formatDailyLabel(min, max) }
}

export function bucketizeNumberPositions() {
  console.log('bucketizeNumberPositions')
}
