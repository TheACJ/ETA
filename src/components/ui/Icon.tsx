// src/components/ui/Icon.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Example integration with Heroicons v2
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  // ... other icons
} from '@heroicons/react/24/outline';
import { IconType } from 'react-icons'; // Optional for React Icons

const iconVariants = cva('flex-shrink-0', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    },
    variant: {
      primary: 'text-primary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      error: 'text-error-600',
      neutral: 'text-gray-600',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'neutral',
  },
});

interface IconProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof iconVariants> {
  name: keyof typeof iconMap;
  icon?: IconType | React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
}

const iconMap = {
  spinner: ArrowPathIcon,
  check: CheckCircleIcon,
  cross: XCircleIcon,
  clock: ClockIcon,
  // ... map other icon names to components
};

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      className,
      name,
      icon: CustomIcon,
      size,
      variant,
      title,
      description,
      ...props
    },
    ref
  ) => {
    const IconComponent = (CustomIcon || iconMap[name]) as React.ElementType<React.SVGProps<SVGSVGElement>>;

    if (!IconComponent) {
      console.warn(`Icon "${name}" not found`);
      return null;
    }

    return (
      <span className="inline-flex items-center">
        {typeof IconComponent === 'function' ? (
          <IconComponent
            className={cn(
              iconVariants({ size, variant, className }),
              name === 'spinner' && 'animate-spin'
            )}
            aria-hidden={!title}
            role={title ? 'img' : undefined}
            aria-label={title}
            ref={ref}
            {...props}
          />
        ) : (
          <IconComponent
            className={cn(
              iconVariants({ size, variant, className }),
              name === 'spinner' && 'animate-spin'
            )}
            aria-hidden={!title}
            role={title ? 'img' : undefined}
            aria-label={title}
            ref={ref}
            {...props}
          />
        )}
        {description && (
          <span className="sr-only">{description}</span>
        )}
      </span>
    );
  }
);
Icon.displayName = 'Icon';

export { Icon, iconVariants };