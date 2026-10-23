import { useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  FolderOpen,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, EnquadramentoBadge } from '@/components/ui/Badge';
import { formatKw } from '@/services/calcEngine';
import type { ProjectStatus } from '@/types';

export function DashboardPage() {
  const { projects } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();

  const myProjects = projects.filter((p) => p.projetistaId === user?.id);

  const counts = {
    andamento: myProjects.filter((p) => p.status === 'rascunho' || p.status === 'enviado_analise' || p.status === 'em_analise').length,
    aguardando: myProjects.filter((p) => p.status === 'enviado_analise').length,
    aprovados: myProjects.filter((p) => p.status === 'aprovado').length,
    reprovados: myProjects.filter((p) => p.status === 'reprovado').length,
  };

  const recentProjects = [...myProjects].slice(0, 5);

  const indicators = [
    { label: 'Projetos em andamento', value: counts.andamento, icon: <FolderOpen className="h-5 w-5" />, color: 'text-accent-fg bg-accent-soft' },
    { label: 'Aguardando análise', value: counts.aguardando, icon: <Clock className="h-5 w-5" />, color: 'text-warning-fg bg-warning-soft' },
    { label: 'Aprovados', value: counts.aprovados, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-success-fg bg-success-soft' },
    { label: 'Reprovados', value: counts.reprovados, icon: <XCircle className="h-5 w-5" />, color: 'text-danger-fg bg-danger-soft' },
  ];

  const quickActions = [
    { label: 'Novo Projeto', icon: <FolderPlus className="h-5 w-5" />, to: '/app/novo-projeto', color: 'bg-primary text-on-primary hover:bg-primary-hover' },
    { label: 'Meus Projetos', icon: <FolderOpen className="h-5 w-5" />, to: '/app/meus-projetos', color: 'bg-surface border border-line text-fg-2 hover:bg-surface-2' },
    { label: 'Em Análise', icon: <Clock className="h-5 w-5" />, to: '/app/meus-projetos?status=em_analise', color: 'bg-surface border border-line text-fg-2 hover:bg-surface-2' },
    { label: 'Aprovados', icon: <CheckCircle2 className="h-5 w-5" />, to: '/app/meus-projetos?status=aprovado', color: 'bg-surface border border-line text-fg-2 hover:bg-surface-2' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fg">Olá, {user?.name.split(' ')[0]}</h1>
          <p className="text-sm text-muted">Acompanhe seus projetos elétricos e inicie novos cálculos.</p>
        </div>
        <Button icon={<FolderPlus className="h-4 w-4" />} onClick={() => navigate('/app/novo-projeto')}>
          Novo Projeto
        </Button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.to)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${action.color}`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {indicators.map((ind) => (
          <Card key={ind.label} className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${ind.color}`}>
              {ind.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-fg">{ind.value}</p>
              <p className="text-xs text-muted">{ind.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent projects */}
      <Card padding="none">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-5 w-5 text-accent-fg" />
            <h3 className="text-base font-semibold text-fg">Projetos Recentes</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/meus-projetos')}>
            Ver todos
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-subtle">Nenhum projeto criado ainda.</p>
            <Button className="mt-4" icon={<FolderPlus className="h-4 w-4" />} onClick={() => navigate('/app/novo-projeto')}>
              Criar primeiro projeto
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2/50">
                  <th className="px-5 py-3 font-semibold text-muted">Código</th>
                  <th className="px-5 py-3 font-semibold text-muted">Endereço</th>
                  <th className="px-5 py-3 font-semibold text-muted">Data</th>
                  <th className="px-5 py-3 font-semibold text-muted">Demanda</th>
                  <th className="px-5 py-3 font-semibold text-muted">Enquadramento</th>
                  <th className="px-5 py-3 font-semibold text-muted">Status</th>
                  <th className="px-5 py-3 font-semibold text-muted text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentProjects.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-surface-2/70">
                    <td className="px-5 py-3 font-medium text-accent-fg">{p.code}</td>
                    <td className="px-5 py-3 text-fg-2">
                      <div className="max-w-[200px] truncate">{p.data.address}, {p.data.number}</div>
                      <div className="text-xs text-subtle">{p.data.neighborhood}, {p.data.city}</div>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 font-medium text-fg">
                        <Zap className="h-3.5 w-3.5 text-warning-fg" />
                        {formatKw(p.calcResult?.calculatedDemand)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <EnquadramentoBadge enquadramento={p.calcResult?.enquadramento} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/app/projeto/${p.id}`)}>
                        Abrir
                      </Button>
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
