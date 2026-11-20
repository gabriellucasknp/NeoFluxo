/*
 * Símbolo do NeoFluxo: o N em ponta (manual da marca 1.0, design-system/neofluxo no vault).
 * Mesmo path dos SVGs do manual, caixa 66 × 92; a cor vem de currentColor.
 */
export const MARK_PATH =
  'M0 27Q0 22 3.54 18.46L16.34 5.66Q22 0 22 8L22 14.5Q22 19.5 25.54 23.04L40.46 37.96Q44 41.5 44 36.5L44 11Q44 6 49 6L61 6Q66 6 66 11L66 65Q66 70 62.46 73.54L49.66 86.34Q44 92 44 84L44 77.5Q44 72.5 40.46 68.96L25.54 54.04Q22 50.5 22 55.5L22 81Q22 86 17 86L5 86Q0 86 0 81Z';

export function NeoFluxoMark({ className = 'h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 66 92" className={`w-auto shrink-0 ${className}`} fill="currentColor" aria-hidden>
      <path d={MARK_PATH} />
    </svg>
  );
}
