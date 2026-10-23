import type { ProjectStatus } from '@/types';

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  rascunho: { label: 'Rascunho', className: 'bg-surface-2 text-muted' },
  enviado_analise: { label: 'Enviado para análise', className: 'bg-info-soft text-info-fg' },
  em_analise: { label: 'Em análise', className: 'bg-warning-soft text-warning-fg' },
  aprovado: { label: 'Aprovado', className: 'bg-success-soft text-success-fg' },
  reprovado: { label: 'Reprovado', className: 'bg-danger-soft text-danger-fg' },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function EnquadramentoBadge({ enquadramento }: { enquadramento?: string }) {
  if (!enquadramento) return <span className="text-xs text-subtle">—</span>; // projeto ainda sem cálculo
  const isBaixa = enquadramento === 'baixa_tensao';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isBaixa ? 'bg-accent-soft text-accent-fg' : 'bg-accent-soft text-accent-fg'
      }`}
    >
      {isBaixa ? 'Baixa Tensão' : 'Média Tensão'}
    </span>
  );
}
