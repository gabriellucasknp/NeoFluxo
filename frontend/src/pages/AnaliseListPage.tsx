import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, EnquadramentoBadge } from '@/components/ui/Badge';
import { formatKw } from '@/services/calcEngine';
import { DataTable, PageHeader, SearchField, Segmented, Select as DsSelect, VazioFiltro, VazioFluxo, type Column } from '@/ds';
import type { Project } from '@/types';

export function AnaliseListPage() {
  const navigate = useNavigate();
  const { projects } = useProjects();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enviado_analise' | 'em_analise' | 'aprovado' | 'reprovado'>('all');
  const [voltageFilter, setVoltageFilter] = useState<'all' | 'baixa_tensao' | 'media_tensao'>('all');
  const [sortByDate, setSortByDate] = useState<'recent' | 'oldest'>('recent');

  // KPI Indicators for Technical Review
  const pendingCount = projects.filter((p) => p.status === 'enviado_analise').length;
  const inReviewCount = projects.filter((p) => p.status === 'em_analise').length;
  const approvedCount = projects.filter((p) => p.status === 'aprovado').length;
  const rejectedCount = projects.filter((p) => p.status === 'reprovado').length;

  // Filter only projects relevant for analysis (ignore local incomplete drafts by default unless requested)
  const analysisProjects = useMemo(() => {
    return projects.filter((p) => p.status !== 'rascunho');
  }, [projects]);

  const filtered = useMemo(() => {
    return analysisProjects.filter((p) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.code.toLowerCase().includes(term) ||
        p.data?.name?.toLowerCase().includes(term) ||
        p.data?.technicalResponsible?.toLowerCase().includes(term) ||
        p.projetistaName?.toLowerCase().includes(term) ||
        p.data?.city?.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesVoltage =
        voltageFilter === 'all' || p.calcResult?.enquadramento === voltageFilter;

      return matchesSearch && matchesStatus && matchesVoltage;
    }).sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.createdAt).getTime();
      const dateB = new Date(b.submittedAt || b.createdAt).getTime();
      return sortByDate === 'recent' ? dateB - dateA : dateA - dateB;
    });
  }, [analysisProjects, search, statusFilter, voltageFilter, sortByDate]);

  const fila = pendingCount + inReviewCount;
  const filtroAtivo = [
    statusFilter !== 'all' && ({ enviado_analise: 'Aguardando', em_analise: 'Em análise', aprovado: 'Aprovados', reprovado: 'Reprovados' } as const)[statusFilter],
    voltageFilter !== 'all' && (voltageFilter === 'baixa_tensao' ? 'Baixa Tensão' : 'Média Tensão'),
    search && `Busca: ${search}`,
  ].filter(Boolean).join(' · ');
  const limpar = () => {
    setStatusFilter('all');
    setVoltageFilter('all');
    setSearch('');
  };

  const colunas: Column<Project>[] = [
    {
      key: 'projeto',
      header: 'Empreendimento',
      width: 'minmax(0,1.6fr)',
      mobileFull: true,
      sort: (p) => p.data?.name ?? '',
      cell: (p, on) => (
        <span className="block min-w-0">
          <span className={`block truncate font-semibold ${on ? '' : 'text-fg'}`}>{p.data?.name}</span>
          <span className={`block truncate text-xs tabular ${on ? 'text-on-highlight/75' : 'text-muted'}`}>
            {p.code} · {p.data?.city || 'Recife'}
          </span>
        </span>
      ),
    },
    {
      key: 'responsavel',
      header: 'Responsável técnico',
      width: 'minmax(0,1.2fr)',
      hideOnMobile: true,
      cell: (p) => <span className="block truncate">{p.data?.technicalResponsible || p.projetistaName}</span>,
    },
    {
      key: 'demanda',
      header: 'Demanda',
      width: '104px',
      sort: (p) => p.calcResult?.calculatedDemand ?? 0,
      cell: (p, on) => <span className={`font-semibold tabular ${on ? '' : 'text-fg'}`}>{formatKw(p.calcResult?.calculatedDemand || 0)}</span>,
    },
    {
      key: 'enquadramento',
      header: 'Enquadramento',
      width: '140px',
      hideOnMobile: true,
      cell: (p, on) => <EnquadramentoBadge enquadramento={p.calcResult?.enquadramento} onColor={on} />,
    },
    {
      key: 'enviado',
      header: 'Enviado em',
      width: '100px',
      hideOnMobile: true,
      sort: (p) => p.submittedAt || p.createdAt,
      cell: (p) => <span className="tabular">{new Date(p.submittedAt || p.createdAt).toLocaleDateString('pt-BR')}</span>,
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
      key: 'acao',
      header: '',
      width: '140px',
      align: 'right',
      hideOnMobile: true,
      cell: (p) =>
        p.status === 'enviado_analise' || p.status === 'em_analise' ? (
          <span onClick={(e) => e.stopPropagation()}>
            <Button size="sm" arrow onClick={() => navigate(`/app/analise/${p.id}`)}>
              Avaliar
            </Button>
          </span>
        ) : (
          <span className="text-xs font-semibold opacity-70">Ver parecer</span>
        ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        greeting="Análise técnica"
        title="Fila de análise"
        stats={[
          { label: 'Na fila', value: String(fila) },
          { label: 'Aprovados', value: String(approvedCount) },
          { label: 'Reprovados', value: String(rejectedCount) },
        ]}
      />

      <Card padding="lg">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por protocolo, empreendimento ou projetista" className="w-full xl:max-w-sm" />
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              label="Filtrar por status"
              size="sm"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as typeof statusFilter)}
              items={[
                { value: 'all', label: 'Todos', count: analysisProjects.length },
                { value: 'enviado_analise', label: 'Aguardando', count: pendingCount },
                { value: 'em_analise', label: 'Em análise', count: inReviewCount },
                { value: 'aprovado', label: 'Aprovados', count: approvedCount },
                { value: 'reprovado', label: 'Reprovados', count: rejectedCount },
              ]}
            />
            <DsSelect
              pill
              value={voltageFilter}
              onChange={(v) => setVoltageFilter(v as any)}
              options={[
                { value: 'all', label: 'Todas as tensões' },
                { value: 'baixa_tensao', label: 'Baixa Tensão', hint: 'até 75 kW' },
                { value: 'media_tensao', label: 'Média Tensão', hint: 'acima de 75 kW' },
              ]}
            />
            <DsSelect
              pill
              value={sortByDate}
              onChange={(v) => setSortByDate(v as any)}
              options={[
                { value: 'recent', label: 'Mais recentes' },
                { value: 'oldest', label: 'Mais antigos' },
              ]}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          filtroAtivo && !(statusFilter === 'enviado_analise' && fila === 0) ? (
            <VazioFiltro filtro={filtroAtivo} onLimpar={limpar} title="Nada com esse filtro" action={<Button variant="secondary" size="sm" onClick={limpar}>Limpar filtro</Button>}>
              {`A fila tem ${analysisProjects.length} projetos nos outros filtros.`}
            </VazioFiltro>
          ) : (
            <VazioFluxo title="Fila zerada">Nenhum projeto esperando parecer. O próximo aparece aqui assim que for enviado.</VazioFluxo>
          )
        ) : (
          <DataTable rows={filtered} columns={colunas} rowKey={(p) => p.id} onSelect={(p) => navigate(`/app/analise/${p.id}`)} />
        )}
      </Card>
    </div>
  );
}
