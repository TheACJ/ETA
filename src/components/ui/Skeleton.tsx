// src/components/ui/Skeleton.tsx
import React from 'react';
import { cn } from '../../lib/utils'; // Assuming you have a classname utility

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional: Add specific shape classes if needed, e.g., 'rounded-full' for circle */
  shapeClassName?: string;
  /** Optional: Control animation */
  animated?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    { className, shapeClassName, animated = true, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-200 dark:bg-gray-700 rounded-md', // Base styling
          animated && 'animate-pulse',              // Animation class
          shapeClassName,                            // Optional shape override
          className                                  // Allow overriding via className prop
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';


// Specific Skeleton for the Exam Card structure
const ExamCardSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, ...props }, ref) => {
    return (
        <div ref={ref} className={cn("p-6 border rounded-xl shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700", className)} {...props}>
            {/* Header Skeleton */}
            <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-6 w-3/5 rounded" /> {/* Title */}
                <Skeleton className="h-5 w-24 rounded-full" /> {/* Badge */}
            </div>

             {/* Body Skeleton */}
             <div className="space-y-3 text-sm text-gray-600 mb-5">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-2/4 rounded" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-1/3 rounded" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-1/4 rounded" />
                </div>
                 <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-1/5 rounded" />
                </div>
                 <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                </div>
            </div>

            {/* Optional Progress Skeleton */}
            {/* <Skeleton className="h-3 w-full rounded-full mt-4 mb-5" /> */}


            {/* Footer/Button Skeleton */}
            <div className="mt-6 flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-md" /> {/* Main Button */}
                {/* Conditionally show second button skeleton if needed */}
                 {/* <Skeleton className="h-10 w-10 rounded-md" /> */}
            </div>
        </div>
    )
 }
)
ExamCardSkeleton.displayName = "ExamCardSkeleton"


export { Skeleton, ExamCardSkeleton };