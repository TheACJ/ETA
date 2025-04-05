// src/components/ui/Progress.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils'; // Assume you have a classname utility

const progressVariants = cva(
    // Base styles for the container (track)
    'relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
    {
        variants: {
            size: {
            sm: 'h-2',
            md: 'h-3',
            lg: 'h-4',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
);

const progressIndicatorVariants = cva(
    // Base styles for the indicator (filled part)
    'h-full transition-all duration-500 ease-out flex items-center justify-center',
    {
        variants: {
            variant: {
                primary: 'bg-primary-500 dark:bg-primary-400',
                success: 'bg-success-500 dark:bg-success-400',
                warning: 'bg-warning-500 dark:bg-warning-400',
                error: 'bg-error-500 dark:bg-error-400',
                gradient: 'bg-gradient-to-r from-blue-500 to-purple-600',
            },
            // Add striped/animated variants if needed, requires CSS
            striped: {
                true: 'progress-striped', // Define .progress-striped in your CSS
            },
            animated: {
                true: 'animate-stripes', // Define animation in your CSS
            }
        },
        defaultVariants: {
            variant: 'primary',
        },
    }
);


interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants>, // size from container
    Pick<VariantProps<typeof progressIndicatorVariants>, 'variant' | 'striped' | 'animated'> // variant, striped, animated from indicator
     {
  /** Current value of the progress */
  value: number;
  /** Maximum value possible (defaults to 100) */
  max?: number; // <-- Added max prop
  /** Optional label text */
  label?: string;
  /** Whether to show the label (defaults to true if label exists or max > 100) */
  showLabel?: boolean;
  /** Position of the label ('inside' or 'outside') */
  labelPosition?: 'inside' | 'outside';
   /** Custom format function for the label display */
  formatLabel?: (value: number, max: number, percent: number) => React.ReactNode;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100, // Default max to 100
      label,
      showLabel: showLabelProp, // Rename to avoid conflict
      labelPosition = 'outside',
      variant,
      size,
      striped = false,
      animated = false,
      formatLabel,
      ...props
    },
    ref
  ) => {
    // Calculate percentage and clamp between 0 and 100
    const percent = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;

    // Determine default label visibility
    const defaultShowLabel = !!label || max !== 100;
    const showLabel = showLabelProp === undefined ? defaultShowLabel : showLabelProp;


    // Default label formatting
    const defaultFormatLabel = (val: number, maxVal: number, percentage: number): React.ReactNode => {
        if (label) return label; // Use provided label text first
        if (maxVal === 100) return `${Math.round(percentage)}%`; // Simple percentage if max is 100
        return `${val} / ${maxVal}`; // Show value / max otherwise
    }

    const displayedLabel = formatLabel
        ? formatLabel(value, max, percent)
        : defaultFormatLabel(value, max, percent);

    return (
      <div className={cn('w-full', className)} {...props}>
         {/* Outside Label */}
         {showLabel && labelPosition === 'outside' && (
          <div className="flex justify-between mb-1 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
                {displayedLabel}
            </span>
            {/* Optionally show percentage always on the outside right */}
            {/* <span className="text-gray-500 dark:text-gray-400">{Math.round(percent)}%</span> */}
          </div>
        )}

        {/* Progress Track */}
        <div
            ref={ref}
            className={cn(progressVariants({ size }), 'bg-opacity-20 dark:bg-opacity-20')} // Apply size to track, make it slightly transparent
            role="progressbar"
            aria-valuenow={percent} // Use percentage for aria-valuenow
            aria-valuemin={0}
            aria-valuemax={100} // Aria value max is always 100 (percentage)
            aria-label={typeof displayedLabel === 'string' ? displayedLabel : `${value} out of ${max}`}
            >
             {/* Progress Indicator */}
             <div
                className={cn(
                progressIndicatorVariants({ variant, striped, animated }), // Apply variant, striped, animated to indicator
                // Map size to text size for inside label
                size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm' : 'text-xs'
                )}
                style={{ width: `${percent}%` }}
             >
                {/* Inside Label */}
                {showLabel && labelPosition === 'inside' && (
                <span className="font-medium text-white px-2 truncate">
                    {displayedLabel}
                </span>
                )}
            </div>
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress, progressVariants };