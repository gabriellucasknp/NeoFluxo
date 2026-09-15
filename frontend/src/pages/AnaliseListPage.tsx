import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Search, Filter, Zap } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, EnquadramentoBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { formatKw } from '@/services/calcEngine';
import type { ProjectStatus } from '@/types';

const statusFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'enviado_analise', label: 'Enviados' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'aprovado', label: 'Aprovados' },
  { value: 'reprovado', label: 'Reprovados' },
];

export function AnaliseListPage() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !search ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.data.name.toLowerCase().includes(search.toLowerCase()) ||
        p.projetistaName.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || p.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Análise de Projetos</h1>
        <p className="text-sm text-slate-500">Todos os projetos enviados para análise técnica.</p>
      </div>

      <Card padding="sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, projeto ou projetista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
            <Filter className="h-4 w-4 shrink-0 text-slate-400" />
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.value ? 'bg-neo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card padding="none">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="h-12 w-12" />}
            title="Nenhum projeto encontrado"
            message="Tente ajustar os filtros de busca."
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-5 py-3 font-semibold text-slate-600">Código</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Projeto</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Projetista</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Demanda</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Enquadramento</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Norma</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Data</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="cursor-pointer transition-colors hover:bg-slate-50/70" onClick={() => navigate(`/app/analise/${p.id}`)}>
                    <td className="px-5 py-3 font-medium text-neo-700">{p.code}</td>
                    <td className="px-5 py-3 text-slate-700">{p.data.name}</td>
                    <td className="px-5 py-3 text-slate-600">{p.projetistaName}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        {formatKw(p.calcResult.calculatedDemand)}
                      </span>
                    </td>
                    <td className="px-5 py-3"><EnquadramentoBadge enquadramento={p.calcResult.enquadramento} /></td>
                    <td className="px-5 py-3 text-slate-600">{p.calcResult.normaAplicada}</td>
                    <td className="px-5 py-3 text-slate-600">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="sm">Analisar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
