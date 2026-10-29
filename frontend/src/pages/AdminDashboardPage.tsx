import { FolderOpen, Clock, CheckCircle2, XCircle } from '@/ds/icons';
import { useProjects } from '@/hooks/useProjects';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { PageHeader, PieShare, PillBars, SectionHeader, StatCard, VazioLinha } from '@/ds';
import type { ProjectStatus } from '@/types';

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
    { name: 'Baixa Tensão', value: projects.filter((p) => p.calcResult?.enquadramento === 'baixa_tensao').length },
    { name: 'Média Tensão', value: projects.filter((p) => p.calcResult?.enquadramento === 'media_tensao').length },
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

  const total = projects.length;
  const semCalculo = projects.filter((p) => !p.calcResult?.enquadramento).length;
  const maiorStatus = Math.max(1, ...statusData.map((d) => d.value));
  const maiorMotivo = Math.max(1, ...rejectionReasons.map((d) => d.value));
  const STATUS_DE: Record<string, ProjectStatus> = {
    Rascunho: 'rascunho',
    'Enviado para análise': 'enviado_analise',
    'Em análise': 'em_analise',
    Aprovado: 'aprovado',
    Reprovado: 'reprovado',
  };
  const BARRA: Record<ProjectStatus, string> = {
    rascunho: 'bg-muted/40',
    enviado_analise: 'bg-info',
    em_analise: 'bg-warning',
    aprovado: 'bg-success',
    reprovado: 'bg-danger',
  };

  return (
    <div className="space-y-8">
      <PageHeader greeting="Administração" title="Painel administrativo" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total de projetos" value={total} highlight icon={<FolderOpen className="h-5 w-5" />} />
        <StatCard label="Em análise" value={projects.filter((p) => p.status === 'em_analise' || p.status === 'enviado_analise').length} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Aprovados" value={projects.filter((p) => p.status === 'aprovado').length} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Reprovados" value={projects.filter((p) => p.status === 'reprovado').length} icon={<XCircle className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card padding="lg">
          <SectionHeader title="Projetos por status" subtitle={`${total} projetos no sistema`} />
          {/* 5 estados não cabem numa pizza; cor de status é reservada e vai sempre com o nome */}
          <ul className="mt-6 space-y-3.5">
            {statusData.map((d) => (
              <li key={d.name} className="grid grid-cols-[176px_1fr_32px] items-center gap-3">
                <StatusBadge status={STATUS_DE[d.name]} />
                <span className="h-2.5 overflow-hidden rounded-full bg-surface-3">
                  <span className={`block h-full origin-left rounded-full ${BARRA[STATUS_DE[d.name]]}`} style={{ width: `${(d.value / maiorStatus) * 100}%` }} />
                </span>
                <span className="text-right font-display text-lg font-medium tabular text-fg">{d.value}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="lg">
          <SectionHeader title="Projetos por enquadramento" subtitle="Baixa Tensão até 75 kW" />
          <div className="mt-6">
            {enqData.length === 0 ? (
              <VazioLinha>Nenhum projeto calculado ainda.</VazioLinha>
            ) : (
              <PieShare data={[...enqData.map((d) => ({ label: d.name, value: d.value })), ...(semCalculo ? [{ label: 'Sem cálculo ainda', value: semCalculo }] : [])]} size={180} />
            )}
          </div>
        </Card>

        <Card padding="lg">
          <SectionHeader title="Aprovados × reprovados" subtitle="Projetos com parecer" />
          <div className="mt-6">
            <PillBars data={approvedRejected.map((d) => ({ label: d.name, value: d.value }))} height={180} />
          </div>
        </Card>

        <Card padding="lg">
          <SectionHeader title="Motivos de reprovação" subtitle="Do mais comum pro menos" />
          <div className="mt-6">
            {rejectionReasons.length === 0 ? (
              <VazioLinha>Nenhuma reprovação registrada.</VazioLinha>
            ) : (
              <ol className="space-y-4">
                {[...rejectionReasons].sort((x, y) => y.value - x.value).map((r) => (
                  <li key={r.name}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-fg-2">{r.name}</span>
                      <span className="font-semibold tabular text-fg">{r.value}</span>
                    </div>
                    <span className="block h-2.5 overflow-hidden rounded-full bg-surface-3">
                      <span className="block h-full rounded-full bg-danger" style={{ width: `${(r.value / maiorMotivo) * 100}%` }} />
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
