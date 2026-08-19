import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DataStateProps {
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

/** Renders a loading spinner or an error message with retry */
export function DataState({ isLoading, error, onRetry, className }: DataStateProps) {
  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground py-4', className)}>
        <Loader2 size={16} className="animate-spin" />
        <span>Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-start gap-3 rounded-md border border-danger/30 bg-danger/5 p-4', className)}>
        <AlertCircle size={16} className="text-danger mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Failed to load data</p>
          <p className="text-xs text-muted-foreground mt-0.5 break-all">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        )}
      </div>
    );
  }

  return null;
}

/** Inline stat value with optional loading skeleton */
export function StatValue({
  value,
  isLoading,
  suffix,
  prefix,
  className,
}: {
  value: string | number | null | undefined;
  isLoading?: boolean;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  if (isLoading) {
    return <span className="inline-block w-16 h-5 bg-muted animate-pulse rounded" />;
  }

  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span className={cn('font-tabular', className)}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}
