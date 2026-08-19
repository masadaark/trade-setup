import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-border bg-transparent text-foreground',
        success: 'bg-success/15 text-success dark:bg-success/20',
        warning: 'bg-warning/15 text-warning-foreground dark:bg-warning/20',
        danger: 'bg-danger/15 text-danger dark:bg-danger/20',
        muted: 'bg-muted text-muted-foreground',
        bullish: 'bg-success/15 text-success dark:bg-success/20',
        bearish: 'bg-danger/15 text-danger dark:bg-danger/20',
        neutral: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
