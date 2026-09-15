import { mockLogs } from '@/data/mockData';
import { Card, CardHeader } from '@/components/ui/Card';
import { History } from 'lucide-react';

export function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Logs do Sistema</h1>
        <p className="text-sm text-slate-500">Registro de auditoria de todas as ações relevantes.</p>
      </div>

      <Card padding="none">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <History className="h-5 w-5 text-neo-600" />
            <h3 className="text-base font-semibold text-slate-800">Registros de Auditoria</h3>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-5 py-3 font-semibold text-slate-600">Data/Hora</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Usuário</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Ação</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Entidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 text-slate-600">
                    {new Date(log.date).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700">{log.user}</td>
                  <td className="px-5 py-3 text-slate-600">{log.action}</td>
                  <td className="px-5 py-3 text-slate-600">{log.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
