import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Building2,
  Wrench,
  Calculator,
  History,
  FileCheck,
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  QrCode,
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, EnquadramentoBadge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Loading, EmptyState } from '@/components/ui/States';
import { formatKw } from '@/services/calcEngine';
import { Logo } from '@/ds';

export function ProjetoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = id ? getProject(id) : undefined;

  const [qrUrl, setQrUrl] = useState<string>('');
  const [showAtestado, setShowAtestado] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (project?.atestado) {
      const validateUrl = `${window.location.origin}/validar?codigo=${project.atestado.uniqueIdentifier}`;
      QRCode.toDataURL(validateUrl, { width: 200, margin: 1 }).then(setQrUrl).catch(() => {});
    }
  }, [project]);

  if (!project) {
    return (
      <Card>
        <EmptyState
          icon={<AlertTriangle className="h-12 w-12" />}
          title="Projeto não encontrado"
          message="O projeto solicitado não existe ou foi removido."
          action={<Button onClick={() => navigate('/app/meus-projetos')}>Voltar para Meus Projetos</Button>}
        />
      </Card>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const isApproved = project.status === 'aprovado';
  const isRejected = project.status === 'reprovado';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 text-subtle transition-colors hover:bg-surface-2 hover:text-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-fg">{project.code}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-sm text-muted">{project.data.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(project.status === 'rascunho' || project.status === 'reprovado') && (
            <Button
              variant="primary"
              onClick={() => navigate(`/app/novo-projeto?id=${project.id}&step=${project.currentStep || 1}`)}
            >
              Continuar Edição
            </Button>
          )}
          {isApproved && (
            <Button icon={<FileCheck className="h-4 w-4" />} onClick={() => setShowAtestado(true)}>
              Gerar Atestado
            </Button>
          )}
        </div>
      </div>

      {/* Rejection info */}
      {isRejected && project.rejection && (
        <Alert type="error" title={`Projeto reprovado — ${project.rejection.reason}`}>
          <p>{project.rejection.observations}</p>
          <p className="mt-2 text-xs">Analisado por {project.rejection.analyst} em {new Date(project.rejection.date).toLocaleDateString('pt-BR')}</p>
        </Alert>
      )}

      {/* Calculation result card */}
      <Card>
        <CardHeader
          title="Resultado do Cálculo"
          subtitle="Demanda calculada e enquadramento automático"
          icon={<Calculator className="h-5 w-5" />}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs text-muted">Potência instalada total</p>
            <p className="mt-1 text-xl font-bold text-fg">{formatKw(project.calcResult?.totalInstalledPower)}</p>
          </div>
          <div className="rounded-lg border border-accent/40 bg-accent-soft p-4">
            <p className="text-xs text-accent-fg">Demanda calculada</p>
            <p className="mt-1 text-xl font-bold text-accent-fg">{formatKw(project.calcResult?.calculatedDemand)}</p>
          </div>
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs text-muted">Nº de unidades</p>
            <p className="mt-1 text-xl font-bold text-fg">{project.calcResult?.unitCount}</p>
          </div>
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs text-muted">Demanda das unidades</p>
            <p className="mt-1 text-xl font-bold text-fg">{formatKw(project.calcResult?.unitDemand)}</p>
          </div>
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs text-muted">Demanda das áreas comuns</p>
            <p className="mt-1 text-xl font-bold text-fg">{formatKw(project.calcResult?.serviceDemand)}</p>
          </div>
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs text-muted">Norma aplicada</p>
            <p className="mt-1 text-lg font-bold text-fg">{project.calcResult?.normaAplicada}</p>
          </div>
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs text-muted">Enquadramento</p>
            <div className="mt-1"><EnquadramentoBadge enquadramento={project.calcResult?.enquadramento} /></div>
          </div>
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs text-muted">Versão da norma</p>
            <p className="mt-1 text-lg font-bold text-fg">{project.normaVersion}</p>
          </div>
        </div>

        {project.calcResult?.needsSubstation && project.subestacao && (
          <div className="mt-4 rounded-lg border border-warning/30 bg-warning-soft p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-warning-fg" />
              <p className="text-sm font-semibold text-warning-fg">Dimensionamento da Subestação (DIS-NOR-053)</p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div><span className="text-muted">Transformador: </span><span className="font-medium text-fg">{project.subestacao.transformadorLabel}</span></div>
              <div><span className="text-muted">Potência: </span><span className="font-medium text-fg">{project.subestacao.potenciaNominal} kVA</span></div>
              <div><span className="text-muted">Quantidade: </span><span className="font-medium text-fg">{project.subestacao.quantidade}</span></div>
              <div><span className="text-muted">Configuração: </span><span className="font-medium text-fg">{project.subestacao.configuracao}</span></div>
            </div>
          </div>
        )}
      </Card>

      {/* Project data */}
      <Card>
        <CardHeader title="Dados do Projeto" icon={<Building2 className="h-5 w-5" />} />
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {[
            { label: 'Nome', value: project.data.name },
            { label: 'Endereço', value: `${project.data.address}, ${project.data.number}` },
            { label: 'Complemento', value: project.data.complement || '—' },
            { label: 'Bairro', value: project.data.neighborhood },
            { label: 'Cidade', value: project.data.city },
            { label: 'CEP', value: project.data.cep },
            { label: 'CNPJ/CPF', value: project.data.document },
            { label: 'ART/TRT', value: project.data.artNumber || '—' },
            { label: 'Responsável técnico', value: project.data.technicalResponsible },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-muted">{item.label}</p>
              <p className="font-medium text-fg">{item.value}</p>
            </div>
          ))}
        </div>
        {project.data.observations && (
          <div className="mt-3 rounded-lg bg-surface-2 p-3">
            <p className="text-xs text-muted">Observações</p>
            <p className="text-sm text-fg-2">{project.data.observations}</p>
          </div>
        )}
      </Card>

      {/* Units */}
      <Card padding="none">
        <div className="border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-accent-fg" />
            <h3 className="text-base font-semibold text-fg">Unidades Consumidoras</h3>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2/50">
                <th className="px-5 py-3 font-semibold text-muted">Grupo</th>
                <th className="px-5 py-3 font-semibold text-muted">Quantidade</th>
                <th className="px-5 py-3 font-semibold text-muted">Potência instalada</th>
                <th className="px-5 py-3 font-semibold text-muted">Demanda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {project.units.map((u) => {
                const installed = u.loads.reduce((s, l) => s + l.quantity * l.powerPerUnit * u.unitCount, 0) / 1000;
                return (
                  <tr key={u.id}>
                    <td className="px-5 py-3 font-medium text-fg-2">{u.name}</td>
                    <td className="px-5 py-3 text-muted">{u.unitCount}</td>
                    <td className="px-5 py-3 text-muted">{formatKw(installed)}</td>
                    <td className="px-5 py-3 text-muted">{formatKw(installed * 0.7)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Service loads */}
      {project.serviceLoads.length > 0 && (
        <Card padding="none">
          <div className="border-b border-line px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Wrench className="h-5 w-5 text-accent-fg" />
              <h3 className="text-base font-semibold text-fg">Cargas de Serviço</h3>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2/50">
                  <th className="px-5 py-3 font-semibold text-muted">Equipamento</th>
                  <th className="px-5 py-3 font-semibold text-muted">Categoria</th>
                  <th className="px-5 py-3 font-semibold text-muted">Qtd.</th>
                  <th className="px-5 py-3 font-semibold text-muted">Potência</th>
                  <th className="px-5 py-3 font-semibold text-muted">Tipo</th>
                  <th className="px-5 py-3 font-semibold text-muted">Partida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {project.serviceLoads.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3 font-medium text-fg-2">{s.name}</td>
                    <td className="px-5 py-3 text-muted capitalize">{s.category.replace('_', ' ')}</td>
                    <td className="px-5 py-3 text-muted">{s.quantity}</td>
                    <td className="px-5 py-3 text-muted">{formatKw((s.quantity * s.power) / 1000)}</td>
                    <td className="px-5 py-3 text-muted">{s.motorType || '—'}</td>
                    <td className="px-5 py-3 text-muted">{s.startType || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* History */}
      <Card padding="none">
        <div className="border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <History className="h-5 w-5 text-accent-fg" />
            <h3 className="text-base font-semibold text-fg">Histórico do Projeto</h3>
          </div>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            {project.history.map((h, idx) => (
              <div key={h.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    idx === project.history.length - 1 ? 'bg-primary text-on-primary' : 'bg-surface-2 text-muted'
                  }`}>
                    {idx + 1}
                  </div>
                  {idx < project.history.length - 1 && <div className="w-px flex-1 bg-surface-3" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-fg">{h.action}</p>
                  {h.detail && <p className="text-xs text-muted">{h.detail}</p>}
                  <p className="text-xs text-subtle">
                    {new Date(h.date).toLocaleDateString('pt-BR')} · {h.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Atestado Modal */}
      {showAtestado && project.atestado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:static print:p-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm print:hidden" onClick={() => setShowAtestado(false)} />
          <div className="relative w-full max-w-2xl animate-scale-in rounded-xl bg-surface shadow-xl print:shadow-none" ref={printRef}>
            {/* Atestado content */}
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-accent pb-4">
                <Logo />
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent-fg">Atestado</div>
                  <div className="text-sm font-bold text-fg">{project.atestado.code}</div>
                </div>
              </div>

              {/* Title */}
              <div className="my-6 text-center">
                <h2 className="text-xl font-bold text-fg">Atestado de Aprovação de Projeto Elétrico</h2>
                <p className="mt-1 text-sm text-muted">Documento gerado eletronicamente pelo Portal de Projetos Elétricos</p>
              </div>

              {/* Data */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted">Código do Projeto</p>
                  <p className="font-medium text-fg">{project.code}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Identificador Único</p>
                  <p className="font-medium text-fg">{project.atestado.uniqueIdentifier}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted">Consumidor / Projeto</p>
                  <p className="font-medium text-fg">{project.data.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Endereço</p>
                  <p className="font-medium text-fg">{project.data.address}, {project.data.number} — {project.data.neighborhood}, {project.data.city}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">CNPJ/CPF</p>
                  <p className="font-medium text-fg">{project.data.document}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">ART/TRT</p>
                  <p className="font-medium text-fg">{project.data.artNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Responsável Técnico</p>
                  <p className="font-medium text-fg">{project.data.technicalResponsible}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Potência Instalada</p>
                  <p className="font-medium text-fg">{formatKw(project.calcResult?.totalInstalledPower)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Demanda Calculada</p>
                  <p className="font-medium text-fg">{formatKw(project.calcResult?.calculatedDemand)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Enquadramento</p>
                  <p className="font-medium text-fg">{project.calcResult?.enquadramento === 'baixa_tensao' ? 'Baixa Tensão' : 'Média Tensão'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Norma Utilizada</p>
                  <p className="font-medium text-fg">{project.calcResult?.normaAplicada} — {project.normaVersion}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Data de Emissão</p>
                  <p className="font-medium text-fg">{new Date(project.atestado.issueDate).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="mt-6 flex items-center justify-between border-t border-line pt-6">
                <div className="text-xs text-muted">
                  <p>Valide este documento em:</p>
                  <p className="font-medium text-accent-fg">{window.location.origin}/validar?codigo={project.atestado.uniqueIdentifier}</p>
                </div>
                {qrUrl && <img src={qrUrl} alt="QR Code" className="h-24 w-24" />}
              </div>

              <div className="mt-4 text-center text-xs text-subtle">
                Documento gerado eletronicamente. A autenticidade pode ser verificada através do QR Code ou do portal público de validação.
              </div>
            </div>

            {/* Actions (hidden in print) */}
            <div className="flex justify-end gap-3 border-t border-line px-6 py-4 print:hidden">
              <Button variant="outline" onClick={() => setShowAtestado(false)}>Fechar</Button>
              <Button icon={<Download className="h-4 w-4" />} onClick={handlePrint}>Baixar Atestado</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
