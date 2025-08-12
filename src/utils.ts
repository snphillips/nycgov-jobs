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
