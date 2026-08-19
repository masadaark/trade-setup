import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DataState, StatValue } from '../components/ui/data-state';
import { useFredSeries } from '../hooks/useFredData';
import { useQuote, useCurrencyStrength } from '../hooks/useMarketData';
import { computeMacroRegime } from '../services/marketAnalysis';
import { cn } from '../lib/utils';

// Currency strength computed from live FX daily changes
function MacroPanel() {
  const currencyStrength = useCurrencyStrength();
  const fedFunds = useFredSeries('fedFunds');
  const yieldSpread = useFredSeries('yieldSpread');
  const cpi = useFredSeries('cpi');
  const balanceSheet = useFredSeries('balanceSheet');

  const gold = useQuote('GC=F');
  const dxy = useQuote('DX-Y.NYB');

  const yieldNeg = (yieldSpread.latestValue ?? 0) < 0;
  const fedChange = fedFunds.latestValue !== null && fedFunds.prevValue !== null
    ? fedFunds.latestValue - fedFunds.prevValue
    : 0;

  // CPI: compute YoY change (last vs 12th-from-last)
  const cpiObs = cpi.data.filter((o) => o.value !== '.');
  const cpiLatest = cpiObs.at(-1);
  const cpiYearAgo = cpiObs.length > 12 ? cpiObs.at(-13) : null;
  const cpiYoY =
    cpiLatest && cpiYearAgo
      ? (((parseFloat(cpiLatest.value) - parseFloat(cpiYearAgo.value)) /
          parseFloat(cpiYearAgo.value)) *
          100).toFixed(2)
      : null;

  // Balance sheet in trillions
  const bsT =
    balanceSheet.latestValue !== null
      ? (balanceSheet.latestValue / 1_000_000).toFixed(2)
      : null;

  const hasFredError =
    fedFunds.error || yieldSpread.error || cpi.error || balanceSheet.error;

  const macroRegime = computeMacroRegime({
    fedFundsRate: fedFunds.latestValue,
    fedFundsPrev: fedFunds.prevValue,
    yieldSpread: yieldSpread.latestValue,
    cpiYoY: cpiYoY !== null ? parseFloat(cpiYoY) : null,
    goldChangePct: gold.quote?.regularMarketChangePercent ?? null,
    dxyChangePct: dxy.quote?.regularMarketChangePercent ?? null,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold">Macro Regime</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Step 1 of 6 — Determine global macro bias before entering any trade
        </p>
      </div>

      {/* FRED API error banner */}
      {hasFredError && (
        <div className="rounded-md border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-muted-foreground">
          <strong className="text-foreground">FRED data unavailable</strong> — Add your{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">VITE_FRED_API_KEY</code> to{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> to load live data.
          Get a free key at{' '}
          <a
            href="https://fred.stlouisfed.org/docs/api/api_key.html"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-foreground"
          >
            fred.stlouisfed.org
          </a>
          .
        </div>
      )}

      {/* Regime decision summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge variant={macroRegime.variant} className="gap-1">
              {macroRegime.verdict === 'LONG' ? <TrendingUp size={12} /> : macroRegime.verdict === 'SHORT' ? <TrendingDown size={12} /> : null}
              {macroRegime.label}
            </Badge>
            <span className="text-xs text-muted-foreground">Source: Binance WS + FRED + Frankfurter</span>
          </div>
          <CardTitle className="text-xl mt-2">
            Overall Macro Verdict: {macroRegime.verdict} BIAS
          </CardTitle>
          <CardDescription>{macroRegime.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {macroRegime.factors.map((item) => (
              <div key={item.label} className="rounded-md bg-muted/50 p-3 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </span>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
                <span
                  className={cn(
                    'text-xs font-mono',
                    item.sentiment === 'success'
                      ? 'text-success'
                      : item.sentiment === 'danger'
                      ? 'text-danger'
                      : 'text-warning'
                  )}
                >
                  {item.note}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FRED Metric Cards */}
      <section>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Key Economic Indicators — FRED
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Fed Funds Rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold tracking-wider">
                Fed Funds Rate
              </CardDescription>
              <div className="flex items-baseline justify-between mt-1 gap-2">
                <span className="text-2xl font-bold font-tabular">
                  <StatValue
                    value={fedFunds.latestValue !== null ? `${fedFunds.latestValue.toFixed(2)}%` : null}
                    isLoading={fedFunds.isLoading}
                  />
                </span>
                <Badge variant={fedChange > 0 ? 'danger' : fedChange < 0 ? 'success' : 'neutral'}>
                  {fedChange > 0 ? 'Hike' : fedChange < 0 ? 'Cut' : 'Hold'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <DataState isLoading={false} error={fedFunds.error} onRetry={fedFunds.refetch} />
              <p className="text-xs text-muted-foreground">Monthly average — FEDFUNDS</p>
            </CardContent>
          </Card>

          {/* Yield Spread */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold tracking-wider">
                10Y–2Y Yield Spread
              </CardDescription>
              <div className="flex items-baseline justify-between mt-1 gap-2">
                <span
                  className={cn(
                    'text-2xl font-bold font-tabular',
                    yieldNeg ? 'text-danger' : 'text-success'
                  )}
                >
                  <StatValue
                    value={
                      yieldSpread.latestValue !== null
                        ? `${yieldSpread.latestValue > 0 ? '+' : ''}${yieldSpread.latestValue.toFixed(2)}%`
                        : null
                    }
                    isLoading={yieldSpread.isLoading}
                  />
                </span>
                <Badge variant={yieldNeg ? 'danger' : 'success'}>
                  {yieldNeg ? 'Inverted' : 'Normal'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <DataState isLoading={false} error={yieldSpread.error} onRetry={yieldSpread.refetch} />
              <p className="text-xs text-muted-foreground">T10Y2Y — Recession signal</p>
            </CardContent>
          </Card>

          {/* CPI YoY */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold tracking-wider">
                US CPI Inflation YoY
              </CardDescription>
              <div className="flex items-baseline justify-between mt-1 gap-2">
                <span className={cn('text-2xl font-bold font-tabular', parseFloat(cpiYoY ?? '99') < 3 ? 'text-success' : 'text-warning')}>
                  <StatValue
                    value={cpiYoY !== null ? `${cpiYoY}%` : null}
                    isLoading={cpi.isLoading}
                  />
                </span>
                <Badge variant={parseFloat(cpiYoY ?? '99') <= 3 ? 'success' : 'warning'}>
                  {parseFloat(cpiYoY ?? '99') <= 2.5 ? 'Near Target' : 'Elevated'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <DataState isLoading={false} error={cpi.error} onRetry={cpi.refetch} />
              <p className="text-xs text-muted-foreground">CPIAUCSL — Fed 2% target</p>
            </CardContent>
          </Card>

          {/* Fed Balance Sheet */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold tracking-wider">
                Fed Balance Sheet
              </CardDescription>
              <div className="flex items-baseline justify-between mt-1 gap-2">
                <span className="text-2xl font-bold font-tabular">
                  <StatValue
                    value={bsT !== null ? `$${bsT}T` : null}
                    isLoading={balanceSheet.isLoading}
                  />
                </span>
                <Badge variant="muted">QT</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <DataState isLoading={false} error={balanceSheet.error} onRetry={balanceSheet.refetch} />
              <p className="text-xs text-muted-foreground">WALCL — Total assets (weekly)</p>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Intermarket + Currency */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gold vs DXY */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm">Gold (XAU) vs US Dollar Index (DXY)</CardTitle>
              <Badge variant="success">Inverse Correlation</Badge>
            </div>
            <CardDescription>
              Validates Gold momentum — if DXY falls while Gold rises, institutional buying is genuine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Gold */}
              <div className="rounded-md bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground block">Gold Spot (GC=F)</span>
                <DataState isLoading={gold.isLoading} error={gold.error} onRetry={gold.refetch} />
                {!gold.isLoading && gold.quote && (
                  <>
                    <span className={cn('text-xl font-bold font-tabular block', gold.quote.regularMarketChange >= 0 ? 'text-success' : 'text-danger')}>
                      ${gold.quote.regularMarketPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={cn('text-xs font-mono flex items-center gap-1', gold.quote.regularMarketChange >= 0 ? 'text-success' : 'text-danger')}>
                      {gold.quote.regularMarketChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {gold.quote.regularMarketChangePercent.toFixed(2)}%
                    </span>
                  </>
                )}
              </div>
              {/* DXY */}
              <div className="rounded-md bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground block">Dollar Index (DX-Y.NYB)</span>
                <DataState isLoading={dxy.isLoading} error={dxy.error} onRetry={dxy.refetch} />
                {!dxy.isLoading && dxy.quote && (
                  <>
                    <span className={cn('text-xl font-bold font-tabular block', dxy.quote.regularMarketChange >= 0 ? 'text-danger' : 'text-success')}>
                      {dxy.quote.regularMarketPrice.toFixed(2)}
                    </span>
                    <span className={cn('text-xs font-mono flex items-center gap-1', dxy.quote.regularMarketChange >= 0 ? 'text-danger' : 'text-success')}>
                      {dxy.quote.regularMarketChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {dxy.quote.regularMarketChangePercent.toFixed(2)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-md bg-muted/30 border border-border px-3 py-2.5 text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Trader insight:</strong> When DXY weakens while Gold rallies, the move is institutionally driven — confirms a <strong>BUY XAUUSD</strong> bias.
            </div>
          </CardContent>
        </Card>

        {/* Currency Strength */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-sm">Currency Strength Ranking</CardTitle>
            <CardDescription>Daily % change vs prior close — Frankfurter ECB rates</CardDescription>
          </CardHeader>
          <CardContent>
            <DataState
              isLoading={currencyStrength.isLoading}
              error={currencyStrength.error}
              onRetry={currencyStrength.refetch}
            />
            {!currencyStrength.isLoading && !currencyStrength.error && (
            <div className="grid grid-cols-2 gap-2">
              {currencyStrength.currencies.map((c) => (
                <div
                  key={c.symbol}
                  className={cn(
                    'flex items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium border',
                    c.direction === 'up'
                      ? 'bg-success/10 border-success/20 text-success'
                      : 'bg-danger/10 border-danger/20 text-danger'
                  )}
                >
                  <div className="flex items-center gap-1">
                    {c.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span className="font-bold text-foreground">{c.symbol}</span>
                  </div>
                  <span className="font-mono font-bold">{c.change}</span>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MacroPanel;
