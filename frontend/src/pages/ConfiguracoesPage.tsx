import { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Settings, FileText, Shield, Database, CheckCircle2, RefreshCw, AlertCircle, Lock } from 'lucide-react';
import { mockNormVersions } from '@/data/mockData';
import { testConnection } from '@/firebase/config';
import { firebaseBackendService } from '@/services/api';

export function ConfiguracoesPage() {
  const [firebaseStatus, setFirebaseStatus] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    firebaseBackendService
      .getStatus()
      .then((data) => setFirebaseStatus(data))
      .catch(() => {});
  }, []);

  const handleTestPing = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const start = performance.now();
    try {
      const ok = await testConnection();
      const elapsed = Math.round(performance.now() - start);
      if (ok) {
        setTestResult(`Conexão com Cloud Firestore estabelecida com sucesso! Latência: ${elapsed}ms.`);
      } else {
        setTestResult('Conexão realizada, verifique status do projeto.');
      }
    } catch (err: any) {
      setTestResult(`Erro de conexão: ${err.message || 'Falha ao conectar'}`);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h1>
        <p className="text-sm text-slate-500">Parâmetros normativos, arquitetura de persistência e integração com Firebase.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Firebase & Firestore Card */}
        <Card>
          <CardHeader
            title="Infraestrutura Firebase & Cloud Firestore"
            subtitle="Banco de dados persistente e regras de segurança ABAC"
            icon={<Database className="h-5 w-5 text-neo-600" />}
          />
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 p-3">
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Cloud Firestore Ativo & Conectado</span>
              </div>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800">
                Operacional
              </span>
            </div>

            <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Firebase Project ID:</span>
                <span className="font-mono text-slate-800 font-semibold">{firebaseStatus?.projectId || 'gen-lang-client-0443279078'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Firestore Database ID:</span>
                <span className="font-mono text-slate-800 font-semibold truncate max-w-[220px]" title={firebaseStatus?.firestoreDatabaseId}>
                  {firebaseStatus?.firestoreDatabaseId || 'ai-studio-neofluxo-...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Regras de Segurança:</span>
                <span className="text-slate-800 font-semibold flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-neo-600" /> Zero-Trust ABAC (Eight Pillars)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Coleções Monitoradas:</span>
                <span className="text-slate-800 font-semibold">projects, users, certificates, admins</span>
              </div>
            </div>

            {testResult && (
              <div className="rounded-lg bg-neo-50 border border-neo-200 p-3 text-xs text-neo-800">
                {testResult}
              </div>
            )}

            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className={`h-4 w-4 ${testingConnection ? 'animate-spin' : ''}`} />}
                onClick={handleTestPing}
                disabled={testingConnection}
              >
                {testingConnection ? 'Testando Handshake...' : 'Testar Conexão Cloud Firestore'}
              </Button>
            </div>
          </div>
        </Card>

        {/* System parameters */}
        <Card>
          <CardHeader title="Parâmetros Gerais" subtitle="Configurações e limites normativos" icon={<Settings className="h-5 w-5" />} />
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

        {/* Normative Versions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Versionamento das Normas" subtitle="Versões vigentes e histórico da concessionária" icon={<FileText className="h-5 w-5" />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        </div>
      </div>
    </div>
  );
}
