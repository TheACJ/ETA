// src/components/ui/Button.tsx
import React, { ButtonHTMLAttributes } from 'react';
// import { Slot } from '@radix-ui/react-slot'; // Import Slot
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils'; // Assuming you have a classname utility

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Define your variants - using more semantic names potentially
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // Add success/warning based on your theme variables if needed
        success: 'bg-success text-success-foreground hover:bg-success/90',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10', // Adjusted icon size for consistency
      },
    },
    defaultVariants: {
      variant: 'primary', // Changed default to primary (or choose yours)
      size: 'default',
    },
  }
);


// Define Icon component placeholder (or import your actual Icon component)
const IconPlaceholder = ({ className }: { className?: string }) => (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean; // <-- Added asChild prop
  isLoading?: boolean;
  loadingText?: string;
  /** Icon component to render */
  icon?: React.ReactElement; // Expect a React Element for better control
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false, // Default to false
      isLoading = false,
      loadingText,
      icon,
      iconPosition = 'left',
      children,
      disabled, // Capture disabled prop
      ...props
    },
    ref
  ) => {
    // Determine the component type based on asChild
    const Comp = asChild ? 'span' : 'button';

    // Determine final disabled state
    const isDisabled = disabled || isLoading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled} // Pass final disabled state
        // For Slot, pass disabled state via data attribute if its child doesn't handle it
        data-disabled={asChild && isDisabled ? '' : undefined}
        // Add aria-disabled for better accessibility
        aria-disabled={isDisabled}
        {...props} // Spread remaining props onto the component
      >
         {/* Content Wrapper - helps manage layout with loading state */}
        <span className={cn(
            "flex items-center justify-center gap-2", // Base layout
             isLoading ? 'invisible' : 'visible' // Hide content when loading
         )}>
            {icon && iconPosition === 'left' && !isLoading && React.cloneElement(icon, { className: cn("h-4 w-4", icon.props.className) })}
            {children}
            {icon && iconPosition === 'right' && !isLoading && React.cloneElement(icon, { className: cn("h-4 w-4", icon.props.className) })}
        </span>

         {/* Loading Indicator */}
         {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <IconPlaceholder className="animate-spin mr-2" />
            {loadingText || 'Loading...'}
          </span>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };