import React from 'react';

interface StepperProps {
  currentStep: number;
  steps: string[];
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps, className = '' }) => {
  return (
    <nav aria-label="Progress" className={`flex items-center justify-center ${className}`}>
      <ol className="flex items-center space-x-2 md:space-x-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <li key={step} className="flex items-center">
              {/* Step Circle/Number */}
              <span
                className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full text-xs md:text-sm font-semibold
                  ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-200' : ''}
                  ${isCompleted ? 'bg-blue-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-600' : ''}
                `}
              >
                {isCompleted ? (
                  // Checkmark for completed steps
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNumber // Number for active/future steps
                )}
              </span>

              {/* Step Name */}
              <span
                className={`ml-2 hidden text-xs md:block md:text-sm font-medium
                  ${isActive ? 'text-blue-600' : ''}
                  ${isCompleted ? 'text-gray-700' : ''}
                  ${!isActive && !isCompleted ? 'text-gray-500' : ''}
                `}
              >
                {step}
              </span>

              {/* Connecting Line (not after the last step) */}
              {index < steps.length - 1 && (
                <div className={`ml-2 h-0.5 w-8 md:w-16 flex-auto rounded
                  ${isCompleted ? 'bg-blue-500' : 'bg-gray-200'}
                `}></div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};