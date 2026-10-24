import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  QrCode,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { formatKw } from '@/services/calcEngine';
import { certificateService } from '@/services/api';
import { Logo } from '@/ds';

export function ValidarAtestadoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('codigo') || '');
  const [result, setResult] = useState<any | 'not_found' | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const performSearch = async (searchCode: string) => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setSearched(true);
    setSearchParams({ codigo: searchCode });

    try {
      const data = await certificateService.validate(searchCode.trim());
      if (data && data.valid) {
        setResult({
          data: {
            name: data.project.name,
            technicalResponsible: data.project.technicalResponsible,
            address: data.project.address,
          },
          calcResult: {
            calculatedDemand: data.project.calculatedDemand,
            enquadramento: data.project.enquadramento,
            normaAplicada: data.project.normaAplicada,
          },
          atestado: data.certificate,
        });
      } else {
        setResult('not_found');
      }
    } catch (err) {
      console.error('Erro na validação do atestado:', err);
      setResult('not_found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialCode = searchParams.get('codigo');
    if (initialCode) {
      performSearch(initialCode);
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface-2">
      {/* Header */}
      <header className="border-b border-line bg-surface shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden border-l border-line pl-4 text-xs font-medium text-muted sm:block">Autenticação de atestado</span>
          </div>
          <a href="/" className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent-fg transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Portal Corporativo
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft border border-accent/40 shadow-sm">
            <ShieldCheck className="h-9 w-9 text-accent-fg" />
          </div>
          <h1 className="text-2xl font-extrabold text-fg">Validação de Atestado Digital</h1>
          <p className="mt-1 text-sm text-muted">
            Digite o identificador alfanumérico ou escaneie o QR Code do documento para atestar a autenticidade técnica.
          </p>
        </div>

        {/* Search */}
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && performSearch(code)}
                placeholder="Ex: NEO-AT-2026-001-A9F4E ou AT-2026-001"
                className="input-base pl-9 font-mono"
              />
            </div>
            <Button
              icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              onClick={() => performSearch(code)}
              disabled={loading || !code.trim()}
            >
              {loading ? 'Consultando...' : 'Verificar Atestado'}
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-subtle">
            <QrCode className="h-4 w-4 text-accent-fg" />
            O link do QR Code impresso no documento redireciona automaticamente para esta validação.
          </div>
        </Card>

        {/* Result */}
        {searched && !loading && result === 'not_found' && (
          <div className="mt-6 animate-fade-in">
            <Alert type="error" title="Atestado não encontrado ou inválido">
              O código informado não corresponde a nenhum documento homologado no sistema.
              Certifique-se de que os caracteres foram digitados corretamente ou consulte a superintendência técnica da Neoenergia.
            </Alert>
          </div>
        )}

        {searched && !loading && result && result !== 'not_found' && (
          <div className="mt-6 animate-fade-in">
            <Card>
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-success-soft p-4 border border-success/30">
                <CheckCircle2 className="h-7 w-7 shrink-0 text-success-fg" />
                <div>
                  <p className="font-bold text-success-fg text-base">Atestado Válido e Autêntico</p>
                  <p className="text-xs text-success-fg">
                    Documento emitido e homologado pela Neoenergia Pernambuco.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted">Número do Atestado</p>
                  <p className="font-mono font-bold text-fg">{result.atestado?.code}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Data de Emissão</p>
                  <p className="font-medium text-fg">
                    {result.atestado?.issueDate ? new Date(result.atestado.issueDate).toLocaleDateString('pt-BR') : '—'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted">Empreendimento / Projeto</p>
                  <p className="font-bold text-fg text-base">{result.data.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Responsável Técnico</p>
                  <p className="font-medium text-fg">{result.data.technicalResponsible}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Demanda Homologada</p>
                  <p className="font-extrabold text-accent-fg">{formatKw(result.calcResult?.calculatedDemand)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Enquadramento Normativo</p>
                  <p className="font-medium text-fg">
                    {result.calcResult?.enquadramento === 'baixa_tensao' ? 'Baixa Tensão (BT)' : 'Média Tensão (MT)'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Norma Aplicada</p>
                  <p className="font-medium text-fg">{result.calcResult?.normaAplicada}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-line pt-3 text-center text-xs text-muted font-mono">
                Identificador Único Global: <strong>{result.atestado?.uniqueIdentifier}</strong>
              </div>
            </Card>
          </div>
        )}

        {/* Demo hints */}
        {!searched && (
          <div className="mt-6 rounded-xl border border-info/30 bg-info-soft/70 p-4 text-center text-sm text-info-fg">
            <p className="font-semibold">Códigos de demonstração cadastrados no banco de dados:</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => { setCode('AT-2026-001'); performSearch('AT-2026-001'); }}
                className="rounded-lg bg-surface px-3 py-1 font-mono text-xs font-semibold text-info-fg shadow-sm hover:bg-info-soft"
              >
                AT-2026-001
              </button>
              <button
                type="button"
                onClick={() => { setCode('NEO-AT-2026-001-A9F4E'); performSearch('NEO-AT-2026-001-A9F4E'); }}
                className="rounded-lg bg-surface px-3 py-1 font-mono text-xs font-semibold text-info-fg shadow-sm hover:bg-info-soft"
              >
                NEO-AT-2026-001-A9F4E
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
