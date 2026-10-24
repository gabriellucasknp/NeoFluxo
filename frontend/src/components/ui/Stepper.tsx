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
    // rolar no x também corta no y: a folga (p-2, devolvida no -m-2) deixa o passo ativo crescer e a sombra aparecer
    <div className="-mx-2 -mt-2 mb-6 overflow-x-auto p-2 pb-3 scrollbar-thin">
      <div className="min-w-[560px]">
        <DsStepper steps={todos} current={atual} />
      </div>
    </div>
  );
}
