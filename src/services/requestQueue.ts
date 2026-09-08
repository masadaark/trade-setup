/**
 * Isolated per-provider request queues.
 * Fast providers (e.g. Binance USD-M Futures) execute immediately without queue bottlenecks,
 * while rate-limited providers (e.g. Yahoo) are queued in their own isolated lane.
 */

const GAPS_MS: Record<string, number> = {
  yahoo: 1500,
  binance: 0, // Zero throttle: Binance futures supports high concurrency and ultra-low latency (<50ms)
  frankfurter: 50,
  fred: 200,
  alphavantage: 1200,
  cftc: 100,
};

const providerChains: Record<string, Promise<unknown>> = {};
const providerLastCallAt: Record<string, number> = {};

export function enqueue<T>(provider: keyof typeof GAPS_MS, fn: () => Promise<T>): Promise<T> {
  const gap = GAPS_MS[provider] ?? 0;

  // Fast path: zero-throttle providers execute immediately
  if (gap === 0) {
    return fn();
  }

  const prevChain = providerChains[provider] ?? Promise.resolve();

  const task = async (): Promise<T> => {
    const lastAt = providerLastCallAt[provider] ?? 0;
    const wait = gap - (Date.now() - lastAt);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    providerLastCallAt[provider] = Date.now();
    return fn();
  };

  const result = prevChain.then(task) as Promise<T>;
  providerChains[provider] = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

