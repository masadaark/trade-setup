/** Serializes API calls with a minimum gap to respect rate limits */

let chain: Promise<unknown> = Promise.resolve();
let lastCallAt = 0;

const GAPS_MS: Record<string, number> = {
  yahoo: 2000,
  binance: 300,
  frankfurter: 300,
  fred: 400,
  alphavantage: 1200,
  cftc: 200,
};

export function enqueue<T>(provider: keyof typeof GAPS_MS, fn: () => Promise<T>): Promise<T> {
  const gap = GAPS_MS[provider];

  const task = async (): Promise<T> => {
    const wait = gap - (Date.now() - lastCallAt);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCallAt = Date.now();
    return fn();
  };

  const result = chain.then(task) as Promise<T>;
  chain = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}
