import type { NYCJobType } from '../types'

const ENDPOINT = 'https://data.cityofnewyork.us/resource/kpav-sd4t.json'
const APP_TOKEN = import.meta.env.VITE_NYC_JOBS_APP_TOKEN as string
// TODO: once app is done, increase this retrieval to a higher number
const RETRIEVAL_LIMIT = 1500

export async function fetchJobs(
  offset = 0,
  limit = RETRIEVAL_LIMIT,
  signal?: AbortSignal
): Promise<NYCJobType[]> {
  const url = new URL(ENDPOINT)
  url.searchParams.set('$limit', String(limit))
  url.searchParams.set('$offset', String(offset))
  url.searchParams.set('$order', 'posting_date DESC')

  const res = await fetch(url.toString(), {
    headers: { 'X-App-Token': APP_TOKEN },
    signal,
  })

  if (!res.ok) throw new Error(`NYC Jobs API ${res.status}`)
  return res.json()
}
