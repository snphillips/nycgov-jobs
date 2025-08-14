// import { currencyFormatter } from './utils'

// Format helpers for labels
const toK = (n: number) => `${Math.round(n / 1000)}k`
const fmtAnnualLabel = (min: number, max?: number) =>
  max == null ? `$${toK(min)}+ per year` : `$${toK(min)}–$${toK(max)} per year`

const fmtHourlyLabel = (min: number, max?: number) =>
  max == null ? `$${min}+ per hour` : `$${min}–$${max} per hour`

const fmtDailyLabel = (min: number, max?: number) =>
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
  const f = freq.toLowerCase()

  if (f === 'annual') {
    const step = 20000
    const cap = 200000
    const min = Math.floor(amount / step) * step
    if (amount >= cap) {
      return { key: `annual:${cap}-up`, label: fmtAnnualLabel(cap) }
    }
    const max = min + step
    return { key: `annual:${min}-${max}`, label: fmtAnnualLabel(min, max) }
  }

  if (f === 'hourly') {
    const step = 5
    const cap = 100
    const min = Math.floor(amount / step) * step
    if (amount >= cap) {
      return { key: `hourly:${cap}-up`, label: fmtHourlyLabel(cap) }
    }
    const max = min + step
    return { key: `hourly:${min}-${max}`, label: fmtHourlyLabel(min, max) }
  }

  // default to DAILY
  const step = 50
  const cap = 1000
  const min = Math.floor(amount / step) * step
  if (amount >= cap) {
    return { key: `daily:${cap}-up`, label: fmtDailyLabel(cap) }
  }
  const max = min + step
  return { key: `daily:${min}-${max}`, label: fmtDailyLabel(min, max) }
}
