import { Stepper as DsStepper } from '@/ds';

/* Ponte pro design system: passos em pílula com trilho que enche. */
interface StepperProps {
  steps: string[];
  currentStep: number;
  extraStep?: { label: string; active: boolean } | null;
}

export function Stepper({ steps, currentStep, extraStep }: StepperProps) {
  const todos = extraStep?.active ? [...steps, extraStep.label] : steps;
  const atual = extraStep?.active ? steps.length : currentStep;
  return (
    <div className="mb-8 overflow-x-auto pb-1 scrollbar-thin">
      <div className="min-w-[560px]">
        <DsStepper steps={todos} current={atual} />
      </div>
    </div>
  );
}
