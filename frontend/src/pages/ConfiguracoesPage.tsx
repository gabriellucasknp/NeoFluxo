import { Card, CardHeader } from '@/components/ui/Card';
import { Settings, FileText, Building2, Shield } from 'lucide-react';
import { mockNormVersions } from '@/data/mockData';

export function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h1>
        <p className="text-sm text-slate-500">Parâmetros gerais e versões das normas.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Versionamento das Normas" subtitle="Versões vigentes e histórico" icon={<FileText className="h-5 w-5" />} />
          <div className="space-y-3">
            {mockNormVersions.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-800">{v.norma}</p>
                  <p className="text-xs text-slate-500">Versão {v.version} · Vigente desde {v.startDate}</p>
                  <p className="text-xs text-slate-500">Responsável: {v.responsible}</p>
                </div>
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-success-100 text-success-700">
                  Vigente
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Parâmetros Gerais" subtitle="Configurações do sistema" icon={<Settings className="h-5 w-5" />} />
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="text-slate-600">Limite de enquadramento (BT/MT)</span>
              <span className="font-bold text-slate-800">75 kW</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="text-slate-600">Norma principal (Baixa Tensão)</span>
              <span className="font-bold text-slate-800">DIS-NOR-030</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="text-slate-600">Norma (Média Tensão)</span>
              <span className="font-bold text-slate-800">DIS-NOR-053</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="text-slate-600">Validação pública de atestados</span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-success-100 text-success-700">Ativo</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
