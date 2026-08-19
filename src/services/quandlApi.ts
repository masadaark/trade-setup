import env from '../config/env';

export interface CotRecord {
  date: string;
  commercialLong: number;
  commercialShort: number;
  nonCommercialLong: number;
  nonCommercialShort: number;
  netNonCommercial: number;
}

/** Quandl / Nasdaq Data Link dataset codes for major futures */
export const COT_DATASETS = {
  gold: 'CFTC/088691_F_ALL',
  crude: 'CFTC/067651_F_ALL',
  eurusd: 'CFTC/099741_F_ALL',
  gbpusd: 'CFTC/096742_F_ALL',
  sp500: 'CFTC/13874_F_ALL',
} as const;

export type CotAsset = keyof typeof COT_DATASETS;

/** Fetch CFTC Commitments of Traders data from Quandl/Nasdaq Data Link */
export async function fetchCotData(asset: CotAsset, rows = 52): Promise<CotRecord[]> {
  const apiKey = env.thirdParty.quandl.apiKey;
  const dataset = COT_DATASETS[asset];

  const params = new URLSearchParams({
    api_key: apiKey,
    rows: String(rows),
  });

  const res = await fetch(`/api/quandl/api/v3/datasets/${dataset}.json?${params}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Quandl ${dataset}: ${res.status} ${text.slice(0, 100)}`);
  }

  const json = await res.json();
  const colNames: string[] = json?.dataset?.column_names ?? [];
  const data: unknown[][] = json?.dataset?.data ?? [];

  // Map column indexes
  const idx = (name: string) => colNames.indexOf(name);
  const dateIdx = idx('Date');
  // Column names vary by dataset — find by partial match
  const findIdx = (partial: string) =>
    colNames.findIndex((c) => c.toLowerCase().includes(partial.toLowerCase()));

  const commLongIdx = findIdx('Commercial Long');
  const commShortIdx = findIdx('Commercial Short');
  const nonCommLongIdx = findIdx('Noncommercial Long');
  const nonCommShortIdx = findIdx('Noncommercial Short');

  return [...data]
    .reverse()
    .map((row) => {
      const arr = row as (string | number)[];
      const nonCommLong = Number(arr[nonCommLongIdx] ?? 0);
      const nonCommShort = Number(arr[nonCommShortIdx] ?? 0);
      return {
        date: String(arr[dateIdx]),
        commercialLong: Number(arr[commLongIdx] ?? 0),
        commercialShort: Number(arr[commShortIdx] ?? 0),
        nonCommercialLong: nonCommLong,
        nonCommercialShort: nonCommShort,
        netNonCommercial: nonCommLong - nonCommShort,
      };
    });
}
