// src/components/ui/Badge.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        neutral: 'bg-gray-100 text-gray-800 border-gray-200',
        primary: 'bg-primary-100 text-primary-800 border-primary-200',
        success: 'bg-success-100 text-success-800 border-success-200',
        warning: 'bg-warning-100 text-warning-800 border-warning-200',
        error: 'bg-error-100 text-error-800 border-error-200',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      icon: IconComponent,
      iconPosition = 'left',
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn(badgeVariants({ variant, size, className }))} ref={ref} {...props}>
        {IconComponent && iconPosition === 'left' && (
          <IconComponent className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4', 'mr-1.5')} />
        )}
        {children}
        {IconComponent && iconPosition === 'right' && (
          <IconComponent className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4', 'ml-1.5')} />
        )}
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-1.5 -mr-1 p-0.5 rounded-full hover:bg-gray-200/50 transition-colors"
            aria-label="Dismiss"
          >
            <Icon name="x" className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };