import type { ProjectStatus } from '@/types';
import { StatusBadge as DsStatusBadge, TensionBadge } from '@/ds';

/* Ponte pro design system: status e enquadramento em pílula com ponto. */
export function StatusBadge({ status, onColor }: { status: ProjectStatus; onColor?: boolean }) {
  return <DsStatusBadge status={status} onColor={onColor} />;
}

export function EnquadramentoBadge({ enquadramento, onColor }: { enquadramento?: string; onColor?: boolean }) {
  if (!enquadramento) return <span className="text-xs text-subtle">—</span>; // projeto ainda sem cálculo
  return <TensionBadge media={enquadramento !== 'baixa_tensao'} onColor={onColor} />;
}
