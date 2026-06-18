import type { UserRestaurantEntry } from '../types'

const STORAGE_KEY = 'modu_entries'

export function makeCanonicalKey(name: string, address?: string): string {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  return address?.trim() ? `${norm(name)}||${norm(address)}` : norm(name)
}

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export async function saveEntry(
  entry: Omit<UserRestaurantEntry, 'id' | 'savedAt'>,
): Promise<UserRestaurantEntry> {
  const full: UserRestaurantEntry = { ...entry, id: makeId(), savedAt: Date.now() }
  const existing = await getEntries()
  existing.push(full)
  await chrome.storage.local.set({ [STORAGE_KEY]: existing })
  return full
}

export async function getEntries(): Promise<UserRestaurantEntry[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY)
  return (result[STORAGE_KEY] as UserRestaurantEntry[]) ?? []
}
