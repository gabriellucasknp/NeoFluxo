import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FolderOpen, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatKw } from '@/services/calcEngine';

const STATUS_COLORS: Record<string, string> = {
  Rascunho: '#94a3b8',
  'Enviado para análise': '#3b82f6',
  'Em análise': '#f59e0b',
  Aprovado: '#10b981',
  Reprovado: '#ef4444',
};

const ENQ_COLORS: Record<string, string> = {
  'Baixa Tensão': '#0033A0',
  'Média Tensão': '#8b5cf6',
};

export function AdminDashboardPage() {
  const { projects } = useProjects();

  const statusData = [
    { name: 'Rascunho', value: projects.filter((p) => p.status === 'rascunho').length },
    { name: 'Enviado para análise', value: projects.filter((p) => p.status === 'enviado_analise').length },
    { name: 'Em análise', value: projects.filter((p) => p.status === 'em_analise').length },
    { name: 'Aprovado', value: projects.filter((p) => p.status === 'aprovado').length },
    { name: 'Reprovado', value: projects.filter((p) => p.status === 'reprovado').length },
  ].filter((d) => d.value > 0);

  const enqData = [
    { name: 'Baixa Tensão', value: projects.filter((p) => p.calcResult.enquadramento === 'baixa_tensao').length },
    { name: 'Média Tensão', value: projects.filter((p) => p.calcResult.enquadramento === 'media_tensao').length },
  ].filter((d) => d.value > 0);

  const approvedRejected = [
    { name: 'Aprovados', value: projects.filter((p) => p.status === 'aprovado').length },
    { name: 'Reprovados', value: projects.filter((p) => p.status === 'reprovado').length },
  ];

  const rejectionReasons = projects
    .filter((p) => p.rejection)
    .reduce((acc, p) => {
      const reason = p.rejection!.reason;
      const existing = acc.find((a) => a.name === reason);
      if (existing) existing.value++;
      else acc.push({ name: reason, value: 1 });
      return acc;
    }, [] as { name: string; value: number }[]);

  const indicators = [
    { label: 'Total de projetos', value: projects.length, icon: <FolderOpen className="h-5 w-5" />, color: 'text-neo-600 bg-neo-50' },
    { label: 'Em análise', value: projects.filter((p) => p.status === 'em_analise' || p.status === 'enviado_analise').length, icon: <Clock className="h-5 w-5" />, color: 'text-amber-600 bg-amber-50' },
    { label: 'Aprovados', value: projects.filter((p) => p.status === 'aprovado').length, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-success-600 bg-success-50' },
    { label: 'Reprovados', value: projects.filter((p) => p.status === 'reprovado').length, icon: <XCircle className="h-5 w-5" />, color: 'text-danger-600 bg-danger-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel Administrativo</h1>
        <p className="text-sm text-slate-500">Visão geral do sistema e indicadores de desempenho.</p>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Projetos por Status" icon={<TrendingUp className="h-5 w-5" />} />
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Projetos por Enquadramento" icon={<TrendingUp className="h-5 w-5" />} />
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={enqData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {enqData.map((entry) => (
                  <Cell key={entry.name} fill={ENQ_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Aprovados x Reprovados" icon={<TrendingUp className="h-5 w-5" />} />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={approvedRejected}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0033A0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Principais Motivos de Reprovação" icon={<TrendingUp className="h-5 w-5" />} />
          {rejectionReasons.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-slate-400">
              Nenhuma reprovação registrada.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={rejectionReasons} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
