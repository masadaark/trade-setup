import { useState, useEffect } from 'react';
import { Clock, Moon, Sun, TrendingUp, Minus } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { Badge } from '../ui/badge';
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

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toISOString().substring(11, 19) + ' UTC');
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      id="app-header"
      className={cn(
        'h-14 w-full shrink-0 flex items-center justify-between px-6',
        'border-b border-border bg-background/80 backdrop-blur-sm'
      )}
    >
      {/* Left: Session + Bias */}
      <div className="flex items-center gap-3">
        {/* Market session */}
        <Badge variant={session.active ? 'success' : 'muted'} className="gap-1.5">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              session.active ? 'bg-success animate-pulse' : 'bg-muted-foreground'
            )}
          />
          {session.label}
        </Badge>

        {/* Divider */}
        <div className="hidden md:block h-4 w-px bg-border" />

        {/* Global bias summary — static for now, replace when algo signals are live */}
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">Direction:</span>
          <Badge variant="bullish" className="gap-1">
            <TrendingUp size={11} />
            Bullish
          </Badge>
          <span className="font-medium">Quality:</span>
          <Badge variant="neutral" className="gap-1">
            <Minus size={11} />
            Monitoring
          </Badge>
        </div>
      </div>

      {/* Right: Clock + Theme toggle */}
      <div className="flex items-center gap-3">
        {/* Live clock */}
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

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}

export default Header;
