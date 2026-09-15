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
                      ? 'bg-neo-600 text-white'
                      : isCurrent
                        ? 'bg-neo-100 text-neo-700 ring-2 ring-neo-500'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isCurrent ? 'text-neo-700' : isComplete ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {step}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-2 h-0.5 w-8 rounded-full ${
                    isComplete ? 'bg-neo-600' : 'bg-slate-200'
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
