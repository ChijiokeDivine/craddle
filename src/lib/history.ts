// lib/history.ts
import type { ChainId } from "@/types";

const KEY = "craddle-recent";
const MAX = 6;

export interface RecentSearch {
  address: string;
  chainId: ChainId;
  name?: string | null;
  ts: number;
}

export function loadRecent(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecentSearch[]).slice(0, MAX) : [];
  } catch {
    return [];
  }
}

/** Adds (or moves to the top) a search and returns the new list. */
export function saveRecent(entry: Omit<RecentSearch, "ts">): RecentSearch[] {
  const address = entry.address.toLowerCase();
  const next: RecentSearch[] = [
    { ...entry, address, ts: Date.now() },
    ...loadRecent().filter(
      (r) => !(r.address === address && r.chainId === entry.chainId)
    ),
  ].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: keep the in-memory list */
  }
  return next;
}

export function clearRecent(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
