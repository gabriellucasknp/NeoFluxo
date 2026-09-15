import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, EnquadramentoBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { formatKw } from '@/services/calcEngine';

export function AnalistaDashboardPage() {
  const { projects } = useProjects();
  const navigate = useNavigate();

  const pending = projects.filter((p) => p.status === 'enviado_analise' || p.status === 'em_analise');
  const analyzed = projects.filter((p) => p.status === 'aprovado' || p.status === 'reprovado');
  const approved = projects.filter((p) => p.status === 'aprovado');
  const rejected = projects.filter((p) => p.status === 'reprovado');

  const indicators = [
    { label: 'Aguardando análise', value: pending.length, icon: <Clock className="h-5 w-5" />, color: 'text-amber-600 bg-amber-50' },
    { label: 'Analisados', value: analyzed.length, icon: <ClipboardCheck className="h-5 w-5" />, color: 'text-neo-600 bg-neo-50' },
    { label: 'Aprovados', value: approved.length, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-success-600 bg-success-50' },
    { label: 'Reprovados', value: rejected.length, icon: <XCircle className="h-5 w-5" />, color: 'text-danger-600 bg-danger-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel do Analista</h1>
        <p className="text-sm text-slate-500">Projetos aguardando análise técnica da Neoenergia.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {indicators.map((ind) => (
          <Card key={ind.label} className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${ind.color}`}>
              {ind.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{ind.value}</p>
              <p className="text-xs text-slate-500">{ind.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="none">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ClipboardCheck className="h-5 w-5 text-neo-600" />
            <h3 className="text-base font-semibold text-slate-800">Projetos para Análise</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/analise')}>
            Ver todos
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {pending.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="h-12 w-12" />}
            title="Nenhum projeto aguardando análise"
            message="Todos os projetos enviados já foram analisados."
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
                {pending.map((p) => (
                  <tr key={p.id} className="cursor-pointer transition-colors hover:bg-slate-50/70" onClick={() => navigate(`/app/analise/${p.id}`)}>
                    <td className="px-5 py-3 font-medium text-neo-700">{p.code}</td>
                    <td className="px-5 py-3 text-slate-700">{p.data.name}</td>
                    <td className="px-5 py-3 text-slate-600">{p.projetistaName}</td>
                    <td className="px-5 py-3 text-slate-600">{formatKw(p.calcResult.calculatedDemand)}</td>
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
