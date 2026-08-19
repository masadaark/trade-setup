import { cachedFetch } from './cache';
import { enqueue } from './requestQueue';

export interface CotRecord {
  date: string;
  commercialLong: number;
  commercialShort: number;
  nonCommercialLong: number;
  nonCommercialShort: number;
  netNonCommercial: number;
}

/** CFTC legacy futures-only report market codes */
export const COT_MARKET_CODES = {
  gold: '088691',
  crude: '067651',
  eurusd: '099741',
  gbpusd: '096742',
  sp500: '13874A',
} as const;

export type CotAsset = keyof typeof COT_MARKET_CODES;

interface CftcRow {
  report_date_as_yyyy_mm_dd: string;
  comm_positions_long_all: string;
  comm_positions_short_all: string;
  noncomm_positions_long_all: string;
  noncomm_positions_short_all: string;
}

/** Fetch CFTC Commitments of Traders data (free, no API key) */
export async function fetchCotData(asset: CotAsset, rows = 52): Promise<CotRecord[]> {
  const marketCode = COT_MARKET_CODES[asset];
  const cacheKey = `cftc:${marketCode}:${rows}`;

  return cachedFetch(cacheKey, async () => {
    const params = new URLSearchParams({
      $where: `cftc_contract_market_code='${marketCode}'`,
      $order: 'report_date_as_yyyy_mm_dd DESC',
      $limit: String(rows),
    });

    const res = await enqueue('cftc', () =>
      fetch(`/api/cftc/resource/6dca-aqww.json?${params}`)
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`CFTC ${asset}: ${res.status} ${text.slice(0, 120)}`);
    }

    const json = (await res.json()) as CftcRow[];

    return [...json]
      .reverse()
      .map((row) => {
        const nonCommLong = Number(row.noncomm_positions_long_all ?? 0);
        const nonCommShort = Number(row.noncomm_positions_short_all ?? 0);
        const date = row.report_date_as_yyyy_mm_dd.slice(0, 10);
        return {
          date,
          commercialLong: Number(row.comm_positions_long_all ?? 0),
          commercialShort: Number(row.comm_positions_short_all ?? 0),
          nonCommercialLong: nonCommLong,
          nonCommercialShort: nonCommShort,
          netNonCommercial: nonCommLong - nonCommShort,
        };
      });
  }, 60 * 60 * 1000); // COT updates weekly — cache 1 hour
}
