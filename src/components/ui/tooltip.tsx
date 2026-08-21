import { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: string | ReactNode;
  children?: ReactNode;
  className?: string;
}

/** 
 * A simple CSS-based tooltip component.
 * Automatically adds a Help icon if children are plain text, or wraps the element.
 */
export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <div className={cn("group relative inline-flex items-center gap-1.5 cursor-help", className)}>
      {children}
      <HelpCircle size={13} className="text-muted-foreground/70 group-hover:text-foreground transition-colors shrink-0" />
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 w-max max-w-[220px] rounded-md bg-foreground px-3 py-2 text-[11px] font-medium leading-relaxed text-background opacity-0 shadow-lg transition-all group-hover:opacity-100 dark:bg-[#2A2A2A] dark:text-foreground text-center">
        {content}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground dark:border-t-[#2A2A2A]"></div>
      </div>
    </div>
  );
}

export function TooltipWrapper({ content, children, className }: TooltipProps) {
  return (
    <div className={cn("group relative inline-flex items-center cursor-help", className)}>
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 w-max max-w-[220px] rounded-md bg-foreground px-3 py-2 text-[11px] font-medium leading-relaxed text-background opacity-0 shadow-lg transition-all group-hover:opacity-100 dark:bg-[#2A2A2A] dark:text-foreground text-center">
        {content}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground dark:border-t-[#2A2A2A]"></div>
      </div>
    </div>
  );
}
