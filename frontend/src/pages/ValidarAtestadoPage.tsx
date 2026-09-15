import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  QrCode,
  ArrowLeft,
} from 'lucide-react';
import { mockProjects } from '@/data/mockData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { formatKw } from '@/services/calcEngine';
import type { Project } from '@/types';

export function ValidarAtestadoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('codigo') || '');
  const [result, setResult] = useState<Project | null | 'not_found' | null>(null);
  const [searched, setSearched] = useState(false);

  const performSearch = (searchCode: string) => {
    if (!searchCode.trim()) return;
    const project = mockProjects.find(
      (p) => p.atestado?.uniqueIdentifier === searchCode.trim() || p.atestado?.code === searchCode.trim(),
    );
    setResult(project || 'not_found');
    setSearched(true);
    setSearchParams({ codigo: searchCode });
  };

  useEffect(() => {
    const initialCode = searchParams.get('codigo');
    if (initialCode) {
      performSearch(initialCode);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neo-600">
              <Zap className="h-6 w-6 text-white" fill="white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">Neoenergia Pernambuco</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Validação de Atestado
              </div>
            </div>
          </div>
          <a href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Portal
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neo-50">
            <ShieldCheck className="h-9 w-9 text-neo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Validação de Atestado</h1>
          <p className="mt-1 text-sm text-slate-500">
            Digite o código do atestado ou escaneie o QR Code para verificar a autenticidade.
          </p>
        </div>

        {/* Search */}
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && performSearch(code)}
                placeholder="Digite o código do atestado..."
                className="input-base pl-9"
              />
            </div>
            <Button icon={<Search className="h-4 w-4" />} onClick={() => performSearch(code)}>
              Validar
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <QrCode className="h-4 w-4" />
            Ou escaneie o QR Code impresso no atestado.
          </div>
        </Card>

        {/* Result */}
        {searched && result === 'not_found' && (
          <div className="mt-6">
            <Alert type="error" title="Atestado não encontrado ou inválido.">
              Verifique o código informado e tente novamente. Se o problema persistir, entre em contato com a Neoenergia Pernambuco.
            </Alert>
          </div>
        )}

        {searched && result && result !== 'not_found' && (
          <div className="mt-6 animate-fade-in">
            <Card>
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-success-50 p-4">
                <CheckCircle2 className="h-6 w-6 text-success-600" />
                <div>
                  <p className="font-semibold text-success-700">Atestado válido</p>
                  <p className="text-xs text-success-600">Documento autenticado pelo Portal de Projetos Elétricos</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Código</p>
                  <p className="font-medium text-slate-800">{result.atestado?.code}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Data de emissão</p>
                  <p className="font-medium text-slate-800">{result.atestado && new Date(result.atestado.issueDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">Projeto</p>
                  <p className="font-medium text-slate-800">{result.data.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Responsável técnico</p>
                  <p className="font-medium text-slate-800">{result.data.technicalResponsible}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Demanda</p>
                  <p className="font-medium text-slate-800">{formatKw(result.calcResult.calculatedDemand)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Enquadramento</p>
                  <p className="font-medium text-slate-800">{result.calcResult.enquadramento === 'baixa_tensao' ? 'Baixa Tensão' : 'Média Tensão'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Norma</p>
                  <p className="font-medium text-slate-800">{result.calcResult.normaAplicada}</p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 text-center text-xs text-slate-400">
                Identificador: {result.atestado?.uniqueIdentifier}
              </div>
            </Card>
          </div>
        )}

        {/* Demo hint */}
        {!searched && (
          <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-center text-sm text-blue-700">
            <p className="font-medium">Código de demonstração:</p>
            <p className="mt-1 font-mono text-xs">NEO-AT-2026-001-XK7M3P</p>
          </div>
        )}
      </div>
    </div>
  );
}
