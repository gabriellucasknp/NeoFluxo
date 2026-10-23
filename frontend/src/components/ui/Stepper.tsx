import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number;
  extraStep?: { label: string; active: boolean } | null;
}

export function Stepper({ steps, currentStep, extraStep }: StepperProps) {
  const allSteps = extraStep?.active ? [...steps, extraStep.label] : steps;
  const activeIndex = extraStep?.active ? steps.length : currentStep;

  return (
    <div className="mb-8 overflow-x-auto scrollbar-thin">
      <div className="flex min-w-max items-center gap-1">
        {allSteps.map((step, idx) => {
          const isComplete = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isLast = idx === allSteps.length - 1;
          return (
            <div key={step} className="flex items-center">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isComplete
                      ? 'bg-primary text-on-primary'
                      : isCurrent
                        ? 'bg-accent-soft text-accent-fg ring-2 ring-accent'
                        : 'bg-surface-2 text-subtle'
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isCurrent ? 'text-accent-fg' : isComplete ? 'text-muted' : 'text-subtle'
                  }`}
                >
                  {step}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-2 h-0.5 w-8 rounded-full ${
                    isComplete ? 'bg-primary' : 'bg-surface-3'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
