import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from '@/ds/icons';
import { Button, DataTable, type Column } from '@/ds';
import { StatusBadge, EnquadramentoBadge } from '@/components/ui/Badge';
import { formatKw } from '@/services/calcEngine';
import type { Project } from '@/types';

/*
 * Lista de projetos do projetista (Painel e Meus Projetos): a tabela do design system.
 * A linha inteira abre o projeto; rascunho e reprovado ganham "Continuar edição".
 */
export function ProjetosTabela({ projetos, compacta }: { projetos: Project[]; compacta?: boolean }) {
  const navigate = useNavigate();

  const colunas: Column<Project>[] = [
    {
      key: 'projeto',
      header: 'Projeto',
      width: 'minmax(0,1.7fr)',
      mobileFull: true,
      sort: (p) => p.data.name,
      cell: (p, on) => (
        <span className="block min-w-0">
          <span className={`block truncate font-semibold ${on ? '' : 'text-fg'}`}>{p.data.name || 'Sem nome'}</span>
          <span className={`block text-xs tabular ${on ? 'text-on-highlight/75' : 'text-muted'}`}>{p.code}</span>
        </span>
      ),
    },
    ...(compacta
      ? []
      : [
          {
            key: 'endereco',
            header: 'Endereço',
            width: 'minmax(0,1.3fr)',
            hideOnMobile: true,
            cell: (p: Project, on: boolean) => (
              <span className="block min-w-0">
                <span className="block truncate">{[p.data.address, p.data.number].filter(Boolean).join(', ') || '—'}</span>
                <span className={`block truncate text-xs ${on ? 'text-on-highlight/75' : 'text-muted'}`}>{p.data.neighborhood}</span>
              </span>
            ),
          } as Column<Project>,
        ]),
    {
      key: 'demanda',
      header: 'Demanda',
      width: '104px',
      sort: (p) => p.calcResult?.calculatedDemand ?? -1,
      cell: (p, on) => <span className={`font-semibold tabular ${on ? '' : 'text-fg'}`}>{p.calcResult ? formatKw(p.calcResult.calculatedDemand) : '—'}</span>,
    },
    {
      key: 'enquadramento',
      header: 'Enquadramento',
      width: '140px',
      hideOnMobile: true,
      cell: (p, on) => <EnquadramentoBadge enquadramento={p.calcResult?.enquadramento} onColor={on} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: '176px',
      cell: (p, on) => (
        <span className="flex justify-end md:justify-start">
          <StatusBadge status={p.status} onColor={on} />
        </span>
      ),
    },
    {
      key: 'data',
      header: 'Criado em',
      width: '96px',
      hideOnMobile: true,
      sort: (p) => p.createdAt,
      cell: (p) => <span className="tabular">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>,
    },
    {
      key: 'acao',
      header: '',
      width: '148px',
      align: 'right',
      hideOnMobile: true,
      cell: (p) =>
        p.status === 'rascunho' || p.status === 'reprovado' ? (
          <span onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="secondary" onClick={() => navigate(`/app/novo-projeto?id=${p.id}&step=${p.currentStep || 1}`)}>
              Continuar edição
            </Button>
          </span>
        ) : (
          <ArrowUpRight className="ml-auto h-4 w-4 opacity-60" />
        ),
    },
  ];

  return <DataTable rows={projetos} columns={colunas} rowKey={(p) => p.id} onSelect={(p) => navigate(`/app/projeto/${p.id}`)} />;
}
