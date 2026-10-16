import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Search,
  Filter,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, EnquadramentoBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { formatKw } from '@/services/calcEngine';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fila de Análise Técnica
          </h1>
          <p className="text-sm text-slate-500">
            Pareceres técnicos, homologação de demandas (DIS-NOR-030/053) e emissão de atestados digitais.
          </p>
        </div>
      </div>

      {/* KPI Priority Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'enviado_analise' ? 'all' : 'enviado_analise')}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            statusFilter === 'enviado_analise'
              ? 'border-amber-400 bg-amber-50/90 shadow-sm ring-2 ring-amber-300'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900">{pendingCount}</span>
              {pendingCount > 0 && (
                <span className="inline-flex rounded-full bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                  Ação pendente
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500">Aguardando Avaliação</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'em_analise' ? 'all' : 'em_analise')}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            statusFilter === 'em_analise'
              ? 'border-blue-400 bg-blue-50/90 shadow-sm ring-2 ring-blue-300'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{inReviewCount}</span>
            <p className="text-xs font-medium text-slate-500">Em Análise Técnica</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'aprovado' ? 'all' : 'aprovado')}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            statusFilter === 'aprovado'
              ? 'border-emerald-400 bg-emerald-50/90 shadow-sm ring-2 ring-emerald-300'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{approvedCount}</span>
            <p className="text-xs font-medium text-slate-500">Projetos Aprovados</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'reprovado' ? 'all' : 'reprovado')}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            statusFilter === 'reprovado'
              ? 'border-danger-400 bg-danger-50/90 shadow-sm ring-2 ring-danger-300'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger-100 text-danger-700">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{rejectedCount}</span>
            <p className="text-xs font-medium text-slate-500">Projetos Reprovados</p>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por protocolo, nome do empreendimento, cidade ou projetista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status pills */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'enviado_analise', label: 'Pendentes' },
                { value: 'em_analise', label: 'Em Análise' },
                { value: 'aprovado', label: 'Aprovados' },
                { value: 'reprovado', label: 'Reprovados' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value as any)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                    statusFilter === opt.value
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Voltage Filter */}
            <select
              value={voltageFilter}
              onChange={(e) => setVoltageFilter(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-neo-200"
            >
              <option value="all">Todas as Tensões</option>
              <option value="baixa_tensao">Baixa Tensão (BT $\le$ 75 kW)</option>
              <option value="media_tensao">Média Tensão (MT &gt; 75 kW)</option>
            </select>

            {/* Date sort */}
            <select
              value={sortByDate}
              onChange={(e) => setSortByDate(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-neo-200"
            >
              <option value="recent">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Projects Table */}
      <Card padding="none">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="h-12 w-12 text-slate-300" />}
            title="Nenhum projeto encontrado"
            message="Não há projetos correspondentes aos filtros aplicados na fila de análise técnica."
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <th className="px-5 py-3.5">Protocolo</th>
                  <th className="px-5 py-3.5">Empreendimento</th>
                  <th className="px-5 py-3.5">Responsável Técnico</th>
                  <th className="px-5 py-3.5">Demanda</th>
                  <th className="px-5 py-3.5">Classificação</th>
                  <th className="px-5 py-3.5">Submetido em</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const isPending = p.status === 'enviado_analise' || p.status === 'em_analise';
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/app/analise/${p.id}`)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50/80 ${
                        p.status === 'enviado_analise' ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-neo-700">
                        {p.code}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">{p.data?.name}</div>
                        <div className="text-xs text-slate-400">
                          {p.data?.neighborhood ? `${p.data.neighborhood}, ` : ''}{p.data?.city || 'Recife - PE'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">
                        <div className="font-medium text-slate-800">
                          {p.data?.technicalResponsible || p.projetistaName}
                        </div>
                        <div className="text-slate-400">{p.data?.document || 'CNPJ/CPF informado'}</div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          {formatKw(p.calcResult?.calculatedDemand || 0)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <EnquadramentoBadge enquadramento={p.calcResult?.enquadramento || 'baixa_tensao'} />
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {p.calcResult?.normaAplicada || 'DIS-NOR-030'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        {p.submittedAt
                          ? new Date(p.submittedAt).toLocaleDateString('pt-BR')
                          : new Date(p.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        {isPending ? (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/app/analise/${p.id}`)}
                            className="bg-neo-600 text-white hover:bg-neo-700"
                          >
                            Avaliar Projeto
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/app/analise/${p.id}`)}
                          >
                            Ver Parecer
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
