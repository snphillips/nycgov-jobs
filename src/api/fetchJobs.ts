
import type { NYCJobType } from '../types';

const ENDPOINT = 'https://data.cityofnewyork.us/resource/kpav-sd4t.json';
const APP_TOKEN = import.meta.env.VITE_NYC_JOBS_APP_TOKEN as string;
// while in dev we're only grabbing 10 jobs
const retrievalLimit = 10;

export async function fetchJobs(offset = 0, limit = retrievalLimit): Promise<NYCJobType[]> {

  const url = new URL(ENDPOINT);
  url.searchParams.set('$limit',  String(limit));
  url.searchParams.set('$offset', String(offset));
  url.searchParams.set('$order',  'posting_date DESC'); // example sort

  const res = await fetch(url.toString(), {
    headers: { 'X-App-Token': APP_TOKEN },
  });

  if (!res.ok) throw new Error(`NYC Jobs API ${res.status}`);
  return res.json();
}
