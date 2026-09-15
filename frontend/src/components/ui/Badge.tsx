import type { ProjectStatus } from '@/types';

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  rascunho: { label: 'Rascunho', className: 'bg-slate-100 text-slate-600' },
  enviado_analise: { label: 'Enviado para análise', className: 'bg-blue-100 text-blue-700' },
  em_analise: { label: 'Em análise', className: 'bg-amber-100 text-amber-700' },
  aprovado: { label: 'Aprovado', className: 'bg-success-100 text-success-700' },
  reprovado: { label: 'Reprovado', className: 'bg-danger-100 text-danger-700' },
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

export function EnquadramentoBadge({ enquadramento }: { enquadramento: string }) {
  const isBaixa = enquadramento === 'baixa_tensao';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isBaixa ? 'bg-neo-50 text-neo-700' : 'bg-purple-50 text-purple-700'
      }`}
    >
      {isBaixa ? 'Baixa Tensão' : 'Média Tensão'}
    </span>
  );
}
