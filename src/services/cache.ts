/**
 * Tiered Cache: L1 (in-memory Map) + L2 (sessionStorage) with TTL & request deduplication.
 * Eliminates redundant downloads across page refreshes and tab switches (0ms instant hits).
 */

interface CacheEntry<T> {
  data: T;
  ts: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

const STORAGE_PREFIX = 'trade_setup_cache:';

function getL2<T>(key: string, ttlMs: number): T | null {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - parsed.ts < ttlMs) {
      // Re-populate L1
      store.set(key, parsed);
      return parsed.data;
    }
    sessionStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Ignore storage parse/access errors
  }
  return null;
}

function setL2<T>(key: string, entry: CacheEntry<T>): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Gracefully ignore quota or storage errors
  }
}

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 5 * 60 * 1000
): Promise<T> {
  // 1. Check L1 Memory Cache
  const hitL1 = store.get(key) as CacheEntry<T> | undefined;
  if (hitL1 && Date.now() - hitL1.ts < ttlMs) return hitL1.data;

  // 2. Check L2 Persistent Session Storage (0ms instant hit)
  const hitL2 = getL2<T>(key, ttlMs);
  if (hitL2 !== null) return hitL2;

  // 3. In-flight request deduplication
  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const promise = fetcher()
    .then((data) => {
      const entry: CacheEntry<T> = { data, ts: Date.now() };
      store.set(key, entry);
      setL2(key, entry);
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

export function clearCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    store.clear();
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX)) keysToRemove.push(k);
        }
        for (const k of keysToRemove) sessionStorage.removeItem(k);
      }
    } catch {}
    return;
  }

  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) store.delete(key);
  }
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(STORAGE_PREFIX + keyPrefix);
    }
  } catch {}
}

