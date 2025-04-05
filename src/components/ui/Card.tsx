import React from 'react';
import { cn } from '../../lib/utils'; // Assuming you have a cn utility function

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  title?: string;
  titleClassName?: string;
  icon?: React.ReactNode;
  isInteractive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, title, titleClassName, icon, isInteractive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-lg shadow-md border border-gray-200",
          isInteractive && "hover:shadow-md hover:-translate-y-1 cursor-pointer",
          className
        )}
        {...props}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className={cn("text-xl font-semibold", titleClassName)}>
              {title}
            </h2>
            {icon && <div className="text-muted-foreground">{icon}</div>}
          </div>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';