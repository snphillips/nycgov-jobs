import { openDB } from 'idb'
import type { NYCJobType } from './types'

const DB_NAME = 'nycJobsDB'
const STORE_NAME = 'jobs'

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

export async function saveJobsToDB(jobs: NYCJobType[]) {
  const db = await getDB()
  await db.put(STORE_NAME, jobs, 'cachedJobs')
  await db.put(STORE_NAME, Date.now(), 'timestamp')
}

export async function getJobsFromDB(): Promise<NYCJobType[] | null> {
  const db = await getDB()
  return (await db.get(STORE_NAME, 'cachedJobs')) || null
}

export async function getCacheTimestamp(): Promise<number | null> {
  const db = await getDB()
  return (await db.get(STORE_NAME, 'timestamp')) || null
}

export async function clearJobsCache() {
  const db = await getDB()
  await db.delete(STORE_NAME, 'cachedJobs')
  await db.delete(STORE_NAME, 'timestamp')
}
