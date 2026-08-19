import { useState, useEffect } from 'react';
import { Clock, Moon, Sun, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { Badge } from '../ui/badge';
import { useTradeSetups } from '../../hooks/useMarketData';
import { useLivePrice } from '../../hooks/useLivePrice';
import { useFredSeries } from '../../hooks/useFredData';
import { computeMacroRegime, computeGlobalBias } from '../../services/marketAnalysis';
import { formatPrice } from '../../hooks/useMarketData';
import { cn } from '../../lib/utils';

function getMarketSession(): { label: string; active: boolean } {
  const hour = new Date().getUTCHours();
  if (hour >= 13 && hour < 22) return { label: 'NY Session', active: true };
  if (hour >= 7 && hour < 16) return { label: 'London Session', active: true };
  if (hour >= 0 && hour < 9) return { label: 'Asia Session', active: true };
  return { label: 'Off-hours', active: false };
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      id="theme-toggle"
      aria-label="Toggle dark/light mode"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-md',
        'border border-border bg-muted hover:bg-accent',
        'text-muted-foreground hover:text-foreground',
        'transition-colors'
      )}
    >
      {resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

function Header() {
  const [timeStr, setTimeStr] = useState('');
  const session = getMarketSession();
  const { bestSetup } = useTradeSetups();
  const fedFunds = useFredSeries('fedFunds');
  const gold = useLivePrice('GC=F');
  const dxy = useLivePrice('DX-Y.NYB');

  const macroRegime = computeMacroRegime({
    fedFundsRate: fedFunds.latestValue,
    fedFundsPrev: fedFunds.prevValue,
    yieldSpread: null,
    cpiYoY: null,
    goldChangePct: gold.quote?.regularMarketChangePercent ?? null,
    dxyChangePct: dxy.quote?.regularMarketChangePercent ?? null,
  });

  const bias = computeGlobalBias(macroRegime.verdict, bestSetup);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toISOString().substring(11, 19) + ' UTC');
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const goldPrice = gold.quote?.regularMarketPrice;
  const goldChg = gold.quote?.regularMarketChangePercent ?? 0;

  return (
    <header
      id="app-header"
      className={cn(
        'h-14 w-full shrink-0 flex items-center justify-between px-6',
        'border-b border-border bg-background/80 backdrop-blur-sm'
      )}
    >
      <div className="flex items-center gap-3">
        <Badge variant={session.active ? 'success' : 'muted'} className="gap-1.5">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              session.active ? 'bg-success animate-pulse' : 'bg-muted-foreground'
            )}
          />
          {session.label}
        </Badge>

        <div className="hidden md:block h-4 w-px bg-border" />

        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">Direction:</span>
          <Badge
            variant={
              bias.direction === 'Bullish'
                ? 'bullish'
                : bias.direction === 'Bearish'
                ? 'bearish'
                : 'neutral'
            }
            className="gap-1"
          >
            {bias.direction === 'Bullish' ? (
              <TrendingUp size={11} />
            ) : bias.direction === 'Bearish' ? (
              <TrendingDown size={11} />
            ) : (
              <Minus size={11} />
            )}
            {bias.direction}
          </Badge>
          <span className="font-medium">Quality:</span>
          <Badge variant={bias.quality === 'Monitoring' ? 'neutral' : 'secondary'} className="gap-1">
            {bias.quality}
          </Badge>
        </div>

        {goldPrice != null && (
          <>
            <div className="hidden lg:block h-4 w-px bg-border" />
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
              <span className="text-muted-foreground">XAU</span>
              <span className="font-bold text-foreground">
                {formatPrice('GC=F', goldPrice)}
              </span>
              <span className={cn('font-semibold', goldChg >= 0 ? 'text-success' : 'text-danger')}>
                {goldChg >= 0 ? '+' : ''}{goldChg.toFixed(2)}%
              </span>
              {gold.isLive && (
                <Badge variant="success" className="text-[10px] px-1 py-0">WS</Badge>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            'hidden sm:flex items-center gap-1.5',
            'text-xs font-mono text-muted-foreground',
            'bg-muted px-2.5 py-1 rounded-md'
          )}
        >
          <Clock size={12} />
          <span>{timeStr || '--:--:-- UTC'}</span>
          <span className="text-success font-sans font-semibold">LIVE</span>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}

export default Header;
