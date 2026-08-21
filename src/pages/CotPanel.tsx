import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DataState, StatValue } from '../components/ui/data-state';
import { useCotData } from '../hooks/useCotData';
import { type CotAsset } from '../services/cftcApi';
import { interpretCotSignal, computeCommercialNet } from '../services/marketAnalysis';
import { cn } from '../lib/utils';
import { Tooltip } from '../components/ui/tooltip';

const ASSET_OPTIONS: { value: CotAsset; label: string; description: string }[] = [
  { value: 'gold', label: 'Gold (XAU)', description: 'Non-commercial positioning in Gold futures' },
  { value: 'crude', label: 'Crude Oil', description: 'WTI crude oil speculative positioning' },
  { value: 'eurusd', label: 'EUR/USD', description: 'Euro FX futures speculative positioning' },
  { value: 'gbpusd', label: 'GBP/USD', description: 'British Pound futures speculative positioning' },
  { value: 'sp500', label: 'S&P 500', description: 'E-mini S&P 500 speculative positioning' },
];

function formatNet(n: number): string {
  const abs = Math.abs(n);
  const sign = n >= 0 ? '+' : '-';
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`;
  return `${sign}${abs}`;
}

function CotPanel() {
  const [selectedAsset, setSelectedAsset] = useState<CotAsset>('gold');
  const selectedOption = ASSET_OPTIONS.find((a) => a.value === selectedAsset)!;

  const { data, latestRecord, isLoading, error, refetch } = useCotData(selectedAsset);

  const cotSignal = interpretCotSignal(data);
  const interpretation = data.length > 0 ? cotSignal : null;

  // COT Index percentile (brain: normalize net position vs historical range)
  const cotIndex = cotSignal.cotIndex;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold">COT Intelligence</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Step 2 of 6 — Track institutional positioning via CFTC Commitments of Traders report
        </p>
      </div>

      {/* Asset selector */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Tabs value={selectedAsset} onValueChange={(v) => setSelectedAsset(v as CotAsset)}>
          <TabsList>
            {ASSET_OPTIONS.map((opt) => (
              <TabsTrigger key={opt.value} value={opt.value}>
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <span className="text-xs text-muted-foreground">
          Source: CFTC Open Data (publicreporting.cftc.gov)
        </span>
      </div>

      {/* Data error state */}
      <DataState isLoading={isLoading} error={error} onRetry={refetch} />

      {/* Main sentiment card */}
      {!isLoading && !error && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant="muted" className="font-mono text-xs">
                  CFTC — {selectedOption.description}
                </Badge>
                {interpretation && (
                  <Badge variant={interpretation.variant} className="gap-1">
                    {interpretation.variant === 'bullish' ? (
                      <TrendingUp size={12} />
                    ) : interpretation.variant === 'bearish' ? (
                      <TrendingDown size={12} />
                    ) : (
                      <Minus size={12} />
                    )}
                    {interpretation.specLabel}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl mt-2">
                Speculator Positioning:{' '}
                {interpretation?.specLabel ?? '—'}
              </CardTitle>
              <CardDescription>
                {latestRecord
                  ? `Latest CFTC report: ${latestRecord.date}. Commercial: ${cotSignal.commercialLabel}${cotSignal.aggressiveCommercial ? ' — aggressive institutional action detected' : ''}.`
                  : 'Loading positioning data…'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Non-commercial net */}
                <div className="rounded-md bg-muted/50 p-4 space-y-1">
                  <Tooltip content="Trend-following speculators. Often wrong at extreme highs or lows.">
                    <span className="text-xs text-muted-foreground font-medium block">
                      Non-Commercial (Specs)
                    </span>
                  </Tooltip>
                  <span
                    className={cn(
                      'text-2xl font-bold font-tabular block',
                      (latestRecord?.netNonCommercial ?? 0) >= 0 ? 'text-success' : 'text-danger'
                    )}
                  >
                    <StatValue
                      value={latestRecord ? formatNet(latestRecord.netNonCommercial) : null}
                    />
                  </span>
                  <span className="text-xs text-muted-foreground">Net contracts</span>
                </div>

                {/* Commercial (Hedgers) */}
                <div className="rounded-md bg-muted/50 p-4 space-y-1">
                  <Tooltip content="Smart Money producers/hedgers. A surge (+40) indicates strong institutional buying/selling.">
                    <span className="text-xs text-muted-foreground font-medium block">
                      Commercial (Hedgers)
                    </span>
                  </Tooltip>
                  <span
                    className={cn(
                      'text-2xl font-bold font-tabular block',
                      (latestRecord?.commercialLong ?? 0) > (latestRecord?.commercialShort ?? 0)
                        ? 'text-success'
                        : 'text-danger'
                    )}
                  >
                    <StatValue
                      value={
                        latestRecord
                          ? formatNet(computeCommercialNet(latestRecord))
                          : null
                      }
                    />
                  </span>
                  <span className="text-xs text-muted-foreground">{cotSignal.commercialLabel}</span>
                </div>

                {/* COT Index */}
                <div className="rounded-md bg-muted/50 p-4 space-y-1">
                  <Tooltip content="0% = Max Bearish, 100% = Max Bullish. >90% or <10% signals a crowded trade reversal.">
                    <span className="text-xs text-muted-foreground font-medium block">
                      COT Index (Percentile)
                    </span>
                  </Tooltip>
                  <span
                    className={cn(
                      'text-2xl font-bold font-tabular block',
                      (cotIndex ?? 50) >= 70
                        ? 'text-success'
                        : (cotIndex ?? 50) <= 30
                        ? 'text-danger'
                        : 'text-foreground'
                    )}
                  >
                    <StatValue value={cotIndex !== null ? `${cotIndex}%` : null} />
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {cotIndex !== null && cotIndex >= 90
                      ? 'Crowded long — contrarian caution'
                      : cotIndex !== null && cotIndex <= 10
                      ? 'Crowded short — contrarian opportunity'
                      : cotIndex !== null && cotIndex >= 70
                      ? 'Bullish percentile'
                      : cotIndex !== null && cotIndex <= 30
                      ? 'Bearish percentile'
                      : 'Neutral range'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historical table */}
          {data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent COT History (Last {Math.min(data.length, 8)} weeks)</CardTitle>
                <CardDescription>Net non-commercial position week-over-week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-2 font-semibold text-muted-foreground pr-4">Date</th>
                        <th className="pb-2 font-semibold text-muted-foreground pr-4">Non-Comm Long</th>
                        <th className="pb-2 font-semibold text-muted-foreground pr-4">Non-Comm Short</th>
                        <th className="pb-2 font-semibold text-muted-foreground">Net Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...data].slice(-8).reverse().map((row) => {
                        const net = row.netNonCommercial;
                        return (
                          <tr key={row.date} className="border-b border-border/50 last:border-0">
                            <td className="py-2 pr-4 font-mono text-muted-foreground">{row.date}</td>
                            <td className="py-2 pr-4 font-tabular text-success">
                              {row.nonCommercialLong.toLocaleString()}
                            </td>
                            <td className="py-2 pr-4 font-tabular text-danger">
                              {row.nonCommercialShort.toLocaleString()}
                            </td>
                            <td className={cn('py-2 font-tabular font-semibold', net >= 0 ? 'text-success' : 'text-danger')}>
                              {formatNet(net)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default CotPanel;
