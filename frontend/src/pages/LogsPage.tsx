import { mockLogs } from '@/data/mockData';
import { Card, CardHeader } from '@/components/ui/Card';
import { History } from 'lucide-react';

export function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">Logs do Sistema</h1>
        <p className="text-sm text-muted">Registro de auditoria de todas as ações relevantes.</p>
      </div>

      <Card padding="none">
        <div className="border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <History className="h-5 w-5 text-accent-fg" />
            <h3 className="text-base font-semibold text-fg">Registros de Auditoria</h3>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2/50">
                <th className="px-5 py-3 font-semibold text-muted">Data/Hora</th>
                <th className="px-5 py-3 font-semibold text-muted">Usuário</th>
                <th className="px-5 py-3 font-semibold text-muted">Ação</th>
                <th className="px-5 py-3 font-semibold text-muted">Entidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {mockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-2/70">
                  <td className="px-5 py-3 text-muted">
                    {new Date(log.date).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-5 py-3 font-medium text-fg-2">{log.user}</td>
                  <td className="px-5 py-3 text-muted">{log.action}</td>
                  <td className="px-5 py-3 text-muted">{log.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
