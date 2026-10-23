import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calculator,
  Building2,
  Wrench,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  FileCheck,
  Clock,
  History,
  Info,
  QrCode,
  FileSpreadsheet,
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, EnquadramentoBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/States';
import { Textarea, Select } from '@/components/ui/FormFields';
import { formatKw } from '@/services/calcEngine';

const rejectionReasons = [
  'Divergência com a planta ou memorial de cargas',
  'Subdimensionamento de cargas de climatização / TUE',
  'Ausência de dimensionamento da subestação (exigido para MT)',
  'Inconsistência nos fatores de demanda aplicados',
  'Documentação técnica / ART incompleta ou divergente',
  'Outro motivo técnico fundamentado',
];

export function AnaliseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, approveProject, rejectProject } = useProjects();
  const { user } = useAuth();
  const project = id ? getProject(id) : undefined;

  const [activeTab, setActiveTab] = useState<'dados' | 'cargas' | 'memoria' | 'subestacao' | 'historico'>('dados');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectObs, setRejectObs] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!project) {
    return (
      <Card>
        <EmptyState
          icon={<AlertTriangle className="h-12 w-12 text-subtle" />}
          title="Projeto não encontrado"
          message="O projeto solicitado não foi localizado na fila de análise técnica."
          action={<Button onClick={() => navigate('/app/analise')}>Voltar para a Fila</Button>}
        />
      </Card>
    );
  }

  const isPending = project.status === 'enviado_analise' || project.status === 'em_analise';
  const isApproved = project.status === 'aprovado';
  const isRejected = project.status === 'reprovado';
  const isMt = project.calcResult?.needsSubstation || project.calcResult?.enquadramento === 'media_tensao';

  const handleApprove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await approveProject(project.id);
      setSuccessMessage('Projeto homologado com sucesso! Atestado digital emitido.');
      setShowApproveModal(false);
      setTimeout(() => navigate('/app/analise'), 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao homologar projeto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (isSubmitting) return;
    if (!rejectReason.trim()) {
      setErrorMessage('Selecione obrigatoriamente um motivo para a emissão do parecer desfavorável.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await rejectProject(project.id, rejectReason, rejectObs);
      setSuccessMessage('Parecer de reprovação registrado com sucesso. O histórico foi atualizado.');
      setShowRejectModal(false);
      setTimeout(() => navigate('/app/analise'), 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar reprovação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button & Title header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/app/analise')}
            className="rounded-xl border border-line bg-surface p-2.5 text-muted shadow-sm transition-colors hover:bg-surface-2 hover:text-fg"
            title="Voltar para a fila de análise"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-fg font-mono">
                {project.code}
              </h1>
              <StatusBadge status={project.status} />
              <EnquadramentoBadge enquadramento={project.calcResult?.enquadramento || 'baixa_tensao'} />
            </div>
            <p className="text-sm text-muted">
              {project.data?.name} · Responsável: <strong>{project.data?.technicalResponsible || project.projetistaName}</strong>
            </p>
          </div>
        </div>

        {/* Quick Decision Actions Header if Pending */}
        {isPending && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              icon={<XCircle className="h-4 w-4 text-danger-fg" />}
              onClick={() => setShowRejectModal(true)}
              className="text-danger-fg hover:bg-danger-soft border-danger/30"
            >
              Emitir Reprovação
            </Button>
            <Button
              icon={<CheckCircle2 className="h-4 w-4" />}
              onClick={() => setShowApproveModal(true)}
              className="bg-success hover:bg-success/90 text-white"
            >
              Aprovar Projeto
            </Button>
          </div>
        )}
      </div>

      {errorMessage && (
        <Alert type="error" title="Atenção">
          <p>{errorMessage}</p>
        </Alert>
      )}

      {successMessage && (
        <Alert type="success" title={successMessage}>
          <p>Atualizando a fila de análise técnica...</p>
        </Alert>
      )}

      {/* Decision Status Banner if already Finalized */}
      {isApproved && (
        <div className="rounded-2xl border border-success/30 bg-success-soft/80 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-success-soft p-2.5 text-success-fg">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-success-fg text-base">Projeto Homologado e Aprovado</h3>
                <p className="text-xs text-success-fg mt-0.5">
                  Atestado Digital: <strong className="font-mono">{project.atestado?.code || project.certificateCode}</strong> ·
                  Identificador: <span className="font-mono">{project.atestado?.uniqueIdentifier}</span>
                </p>
                <p className="text-xs text-success-fg mt-1">
                  Parecer favorável emitido por <strong>{project.atestado?.analystName || 'Analista Neoenergia'}</strong> em {project.approvedAt ? new Date(project.approvedAt).toLocaleDateString('pt-BR') : 'Data registrada'}.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              icon={<QrCode className="h-4 w-4 text-success-fg" />}
              onClick={() => navigate(`/validar?codigo=${project.atestado?.uniqueIdentifier || project.atestado?.code}`)}
              className="border-success/30 text-success-fg hover:bg-success-soft/50 bg-surface"
            >
              Ver Autenticação Pública
            </Button>
          </div>
        </div>
      )}

      {isRejected && project.rejection && (
        <div className="rounded-2xl border border-danger/30 bg-danger-soft/80 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-danger-soft p-2.5 text-danger-fg">
              <XCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-danger-fg text-base">
                Projeto Reprovado — Motivo: {project.rejection.reason}
              </h3>
              <p className="text-xs text-danger-fg">
                {project.rejection.observations || 'Nenhuma observação complementar informada.'}
              </p>
              <p className="text-[11px] text-danger-fg pt-1">
                Analisado por <strong>{project.rejection.analyst}</strong> em {new Date(project.rejection.date).toLocaleDateString('pt-BR')}.
                O projetista foi notificado para realizar as correções no memorial e reenviar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Metric Cards for Fast Technical Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-accent/40 bg-accent-soft/60 p-4">
          <p className="text-xs font-semibold text-accent-fg">Demanda Total Homologada</p>
          <p className="mt-1 text-2xl font-black text-accent-fg font-mono">
            {formatKw(project.calcResult?.calculatedDemand || 0)}
          </p>
          <span className="text-[10px] text-accent-fg">Conforme DIS-NOR-030</span>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-medium text-muted">Potência Instalada Total</p>
          <p className="mt-1 text-xl font-bold text-fg font-mono">
            {formatKw(project.calcResult?.totalInstalledPower || 0)}
          </p>
          <span className="text-[10px] text-subtle">Soma de todas as cargas</span>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-medium text-muted">Classificação de Tensão</p>
          <div className="mt-1.5">
            <EnquadramentoBadge enquadramento={project.calcResult?.enquadramento || 'baixa_tensao'} />
          </div>
          <span className="text-[10px] text-muted block mt-1">
            Norma: <strong>{project.calcResult?.normaAplicada || 'DIS-NOR-030'}</strong>
          </span>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-medium text-muted">Posto de Transformação</p>
          <p className="mt-1 text-sm font-bold text-fg">
            {isMt ? (project.subestacao?.transformadorLabel || 'Subestação Particular') : 'Dispensada (Rede BT)'}
          </p>
          <span className="text-[10px] text-subtle">
            {isMt ? `${project.subestacao?.potenciaNominal || 150} kVA — DIS-NOR-053` : 'Fornecimento BT simples'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs for Technical Deep-dive */}
      <div className="border-b border-line">
        <nav className="flex space-x-6">
          {[
            { id: 'dados', label: '1. Dados Cadastrais & ART', icon: <FileText className="h-4 w-4" /> },
            { id: 'cargas', label: '2. Memorial de Cargas', icon: <Building2 className="h-4 w-4" /> },
            { id: 'memoria', label: '3. Memória de Cálculo Auditável', icon: <FileSpreadsheet className="h-4 w-4" /> },
            { id: 'subestacao', label: isMt ? '4. Subestação (Obrigatória)' : '4. Subestação (BT)', icon: <Building2 className="h-4 w-4" /> },
            { id: 'historico', label: '5. Histórico de Auditoria', icon: <History className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-accent text-accent-fg'
                  : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 1: Dados Cadastrais */}
      {activeTab === 'dados' && (
        <Card>
          <CardHeader
            title="Identificação do Empreendimento e Responsabilidade Técnica"
            subtitle="Dados cadastrais enviados pelo projetista para validação."
            icon={<FileText className="h-5 w-5 text-accent-fg" />}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div className="rounded-lg bg-surface-2 p-3.5 border border-line">
              <span className="text-xs text-muted block">Nome do Projeto:</span>
              <strong className="text-fg text-base">{project.data?.name}</strong>
            </div>
            <div className="rounded-lg bg-surface-2 p-3.5 border border-line">
              <span className="text-xs text-muted block">Endereço Completo:</span>
              <strong className="text-fg">
                {project.data?.address}, {project.data?.number} {project.data?.complement ? `(${project.data.complement})` : ''}
              </strong>
            </div>
            <div className="rounded-lg bg-surface-2 p-3.5 border border-line">
              <span className="text-xs text-muted block">Bairro / Cidade:</span>
              <strong className="text-fg">{project.data?.neighborhood} — {project.data?.city} (CEP: {project.data?.cep})</strong>
            </div>
            <div className="rounded-lg bg-surface-2 p-3.5 border border-line">
              <span className="text-xs text-muted block">CNPJ / CPF do Titular:</span>
              <strong className="text-fg font-mono">{project.data?.document || '—'}</strong>
            </div>
            <div className="rounded-lg bg-surface-2 p-3.5 border border-line">
              <span className="text-xs text-muted block">ART / TRT:</span>
              <strong className="text-fg font-mono">{project.data?.artNumber || 'ART-2026-PENDENTE'}</strong>
            </div>
            <div className="rounded-lg bg-surface-2 p-3.5 border border-line">
              <span className="text-xs text-muted block">Responsável Técnico / CREA:</span>
              <strong className="text-fg">{project.data?.technicalResponsible}</strong>
            </div>
          </div>

          {project.data?.observations && (
            <div className="mt-4 rounded-lg bg-info-soft/70 p-4 border border-info/30 text-xs text-info-fg">
              <strong className="block mb-1 font-semibold">Observações enviadas pelo projetista:</strong>
              <p>{project.data.observations}</p>
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Memorial de Cargas */}
      {activeTab === 'cargas' && (
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Unidades Consumidoras Agrupadas"
              subtitle="Grupos de unidades residenciais, comerciais ou industriais com suas cargas."
              icon={<Building2 className="h-5 w-5 text-accent-fg" />}
            />
            {project.units && project.units.length > 0 ? (
              <div className="space-y-3">
                {project.units.map((unit) => {
                  const unitW = unit.loads?.reduce((s, l) => s + (l.quantity * l.powerPerUnit), 0) || 0;
                  return (
                    <div key={unit.id} className="rounded-xl border border-line overflow-hidden bg-surface">
                      <div className="bg-surface-2 px-4 py-3 border-b border-line flex items-center justify-between">
                        <div>
                          <strong className="text-fg text-sm">{unit.name}</strong>
                          <span className="text-xs text-muted ml-2">
                            ({unit.unitCount} unidade{unit.unitCount > 1 ? 's' : ''} · {unit.unitType})
                          </span>
                        </div>
                        <span className="text-xs font-bold text-accent-fg font-mono">
                          {formatKw((unitW * unit.unitCount) / 1000)} total instalados
                        </span>
                      </div>
                      <div className="p-4">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-muted border-b border-line">
                              <th className="pb-2 font-semibold">Carga</th>
                              <th className="pb-2 font-semibold">Tipo</th>
                              <th className="pb-2 font-semibold">Qtd./Unid.</th>
                              <th className="pb-2 font-semibold">Potência Unitária</th>
                              <th className="pb-2 font-semibold text-right">Potência Grupo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-line">
                            {unit.loads?.map((l) => (
                              <tr key={l.id} className="text-fg-2">
                                <td className="py-1.5 font-medium">{l.label}</td>
                                <td className="py-1.5 uppercase text-[10px] text-muted font-mono">{l.type}</td>
                                <td className="py-1.5">{l.quantity}</td>
                                <td className="py-1.5">{l.powerPerUnit} W</td>
                                <td className="py-1.5 text-right font-mono font-medium">
                                  {formatKw((l.quantity * l.powerPerUnit * unit.unitCount) / 1000)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-subtle py-6 text-center">Nenhuma unidade cadastrada.</p>
            )}
          </Card>

          {/* Cargas de serviço */}
          <Card>
            <CardHeader
              title="Cargas de Serviço / Uso Comum"
              subtitle="Elevadores, bombas, pressurização e iluminação condominial."
              icon={<Wrench className="h-5 w-5 text-accent-fg" />}
            />
            {project.serviceLoads && project.serviceLoads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-line bg-surface-2 text-muted">
                      <th className="px-4 py-2.5 font-semibold">Equipamento</th>
                      <th className="px-4 py-2.5 font-semibold">Categoria</th>
                      <th className="px-4 py-2.5 font-semibold">Quantidade</th>
                      <th className="px-4 py-2.5 font-semibold">Potência Nominal</th>
                      <th className="px-4 py-2.5 font-semibold">Partida / Motor</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Potência Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {project.serviceLoads.map((s) => (
                      <tr key={s.id}>
                        <td className="px-4 py-2 font-medium text-fg">{s.name}</td>
                        <td className="px-4 py-2 text-muted capitalize">{s.category}</td>
                        <td className="px-4 py-2 text-muted">{s.quantity}</td>
                        <td className="px-4 py-2 text-muted">{s.power} W</td>
                        <td className="px-4 py-2 text-muted">
                          {s.motorType || s.startType ? `${s.motorType || ''} ${s.startType ? `(${s.startType})` : ''}` : 'Convencional'}
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-medium text-fg">
                          {formatKw((s.quantity * s.power) / 1000)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-subtle py-4 text-center">Nenhuma carga de serviço cadastrada.</p>
            )}
          </Card>
        </div>
      )}

      {/* Tab 3: Memória de Cálculo Auditável */}
      {activeTab === 'memoria' && (
        <Card>
          <CardHeader
            title="Memória de Cálculo Auditável (DIS-NOR-030)"
            subtitle="Discriminação de todas as cargas com os fatores de demanda normativos aplicados pelo sistema."
            icon={<FileSpreadsheet className="h-5 w-5 text-accent-fg" />}
          />

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-surface-2 text-muted font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Origem / Grupo</th>
                  <th className="px-4 py-3">Descrição da Carga</th>
                  <th className="px-4 py-3">Potência Instalada</th>
                  <th className="px-4 py-3">Fator Demanda</th>
                  <th className="px-4 py-3">Norma & Regra Aplicada</th>
                  <th className="px-4 py-3 text-right">Demanda Resultante (kW)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {project.calcResult?.calculationMemory && project.calcResult?.calculationMemory.length > 0 ? (
                  project.calcResult?.calculationMemory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-2">
                      <td className="px-4 py-2.5 font-medium text-fg">{item.group}</td>
                      <td className="px-4 py-2.5 text-muted">{item.description}</td>
                      <td className="px-4 py-2.5 font-mono text-fg-2">{formatKw(item.totalPowerKw)}</td>
                      <td className="px-4 py-2.5 font-bold text-accent-fg">{(item.demandFactor * 100).toFixed(0)}%</td>
                      <td className="px-4 py-2.5 text-muted italic">{item.ruleReference}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-fg">
                        {formatKw(item.resultDemandKw)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-subtle">
                      Memória sintética consolidada: Demanda de {formatKw(project.calcResult?.calculatedDemand || 0)}.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-line-strong bg-surface-2/70 font-bold text-fg">
                  <td className="px-4 py-3" colSpan={2}>Total Geral do Empreendimento</td>
                  <td className="px-4 py-3 font-mono">{formatKw(project.calcResult?.totalInstalledPower || 0)}</td>
                  <td className="px-4 py-3" colSpan={2}>Enquadramento: {project.calcResult?.normaAplicada || 'DIS-NOR-030'}</td>
                  <td className="px-4 py-3 text-right font-mono text-base text-accent-fg">
                    {formatKw(project.calcResult?.calculatedDemand || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Subestação */}
      {activeTab === 'subestacao' && (
        <Card>
          <CardHeader
            title="Dimensionamento da Subestação e Posto de Transformação"
            subtitle="Regras da norma DIS-NOR-053 para fornecimento em Média Tensão (13,8 kV)."
            icon={<Building2 className="h-5 w-5 text-accent-fg" />}
          />
          {isMt ? (
            <div className="space-y-4">
              <Alert type="warning" title="Projeto em Média Tensão — DIS-NOR-053 Obrigatória">
                Como a demanda calculada de {formatKw(project.calcResult?.calculatedDemand || 0)} ultrapassa 75 kW,
                é compulsória a instalação de subestação transformadora particular abrigada ou aérea.
              </Alert>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                <div className="rounded-xl border border-line bg-surface-2 p-4">
                  <span className="text-xs text-muted block">Transformador Selecionado:</span>
                  <strong className="text-fg text-base">{project.subestacao?.transformadorLabel || 'Transformador Padronizado'}</strong>
                </div>
                <div className="rounded-xl border border-line bg-surface-2 p-4">
                  <span className="text-xs text-muted block">Potência Nominal Total:</span>
                  <strong className="text-fg text-base font-mono">{project.subestacao?.potenciaNominal || 150} kVA</strong>
                </div>
                <div className="rounded-xl border border-line bg-surface-2 p-4">
                  <span className="text-xs text-muted block">Quantidade de Unidades:</span>
                  <strong className="text-fg">{project.subestacao?.quantidade || 1} unidade(s)</strong>
                </div>
                <div className="sm:col-span-2 rounded-xl border border-line bg-surface-2 p-4">
                  <span className="text-xs text-muted block">Configuração Construtiva:</span>
                  <strong className="text-fg">{project.subestacao?.configuracao || 'Abrigada em alvenaria com medição em MT'}</strong>
                </div>
                <div className="sm:col-span-3 rounded-xl border border-line bg-surface-2 p-4">
                  <span className="text-xs text-muted block mb-1">Observações Técnicas da Subestação:</span>
                  <p className="text-xs text-fg-2 leading-relaxed">
                    {project.subestacao?.observacoes || 'Configuração homologada em conformidade com as diretrizes da DIS-NOR-053 da Neoenergia Pernambuco.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Alert type="success" title="Subestação Dispensada — Fornecimento em Baixa Tensão">
              O projeto possui demanda de <strong>{formatKw(project.calcResult?.calculatedDemand || 0)}</strong> (&le; 75 kW),
              estando classificado na <strong>DIS-NOR-030</strong>. O atendimento será realizado diretamente pela rede de distribuição em Baixa Tensão da Neoenergia.
            </Alert>
          )}
        </Card>
      )}

      {/* Tab 5: Histórico de Auditoria */}
      {activeTab === 'historico' && (
        <Card>
          <CardHeader
            title="Trilha de Auditoria e Decisões Anteriores"
            subtitle="Rastreabilidade temporal de todas as etapas e pareceres emitidos."
            icon={<History className="h-5 w-5 text-accent-fg" />}
          />
          <div className="space-y-3">
            {project.history && project.history.length > 0 ? (
              project.history.map((h, i) => (
                <div key={h.id || i} className="flex items-start gap-3 rounded-xl border border-line bg-surface-2/70 p-3.5">
                  <div className="mt-0.5 rounded-full bg-accent-soft p-1.5 text-accent-fg">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm text-fg">{h.action}</strong>
                      <span className="text-xs text-subtle">
                        {h.date ? new Date(h.date).toLocaleDateString('pt-BR') : 'Data não registrada'}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      Responsável: <strong>{h.user || 'Sistema Automático'}</strong>
                    </p>
                    {h.detail && (
                      <p className="text-xs text-muted mt-1 rounded bg-surface p-2 border border-line">
                        {h.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-subtle py-4 text-center">Nenhum evento registrado.</p>
            )}
          </div>
        </Card>
      )}

      {/* Bottom Sticky Action Bar if Pending */}
      {isPending && (
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="font-bold text-fg text-sm">Parecer da Análise Técnica</h4>
            <p className="text-xs text-muted">
              Revise o memorial de cargas e a memória auditável para homologar ou solicitar correções.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              icon={<XCircle className="h-4 w-4 text-danger-fg" />}
              onClick={() => setShowRejectModal(true)}
              className="text-danger-fg border-danger/30 hover:bg-danger-soft"
            >
              Reprovar com Justificativa
            </Button>
            <Button
              icon={<CheckCircle2 className="h-4 w-4" />}
              onClick={() => setShowApproveModal(true)}
              className="bg-success hover:bg-success/90 text-white font-semibold shadow-sm"
            >
              Aprovar e Emitir Atestado Digital
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Aprovação */}
      <Modal
        open={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Confirmar Homologação Técnica do Projeto"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Cancelar
            </Button>
            <Button
              icon={<CheckCircle2 className="h-4 w-4" />}
              onClick={handleApprove}
              disabled={isSubmitting}
              className="bg-success hover:bg-success/90 text-white"
            >
              {isSubmitting ? 'Homologando...' : 'Confirmar Aprovação'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-sm text-muted">
          <p>
            Ao confirmar a aprovação deste projeto, o sistema executará automaticamente:
          </p>
          <ul className="space-y-2 text-xs text-fg-2 bg-surface-2 p-3.5 rounded-xl border border-line">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success-fg shrink-0" />
              <span>Geração do <strong>Atestado Digital de Projeto Elétrico</strong> com identificador global único.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success-fg shrink-0" />
              <span>Criação do código e URL para <strong>validação pública via QR Code</strong>.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success-fg shrink-0" />
              <span>Transição do status do projeto para <strong>Aprovado</strong> e registro na trilha de auditoria.</span>
            </li>
          </ul>
          <div className="rounded-xl bg-accent-soft/70 p-3 text-xs text-accent-fg space-y-1">
            <p><strong>Empreendimento:</strong> {project.data?.name}</p>
            <p><strong>Demanda Homologada:</strong> {formatKw(project.calcResult?.calculatedDemand || 0)}</p>
            <p><strong>Analista Responsável:</strong> {user?.name}</p>
          </div>
        </div>
      </Modal>

      {/* Modal: Confirmar Reprovação */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Emitir Parecer Técnico Desfavorável (Reprovação)"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              icon={<XCircle className="h-4 w-4" />}
              onClick={handleReject}
              disabled={isSubmitting || !rejectReason.trim()}
            >
              {isSubmitting ? 'Registrando...' : 'Confirmar Reprovação'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            A reprovação exige justificativa técnica fundamentada para que o projetista possa realizar as devidas adequações no memorial.
          </p>

          <div>
            <label className="label-base">
              Motivo da Reprovação <span className="text-danger-fg">*</span>
            </label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input-base"
              required
            >
              <option value="">Selecione um motivo...</option>
              {rejectionReasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-base">
              Observações Técnicas & Diretrizes de Correção
            </label>
            <textarea
              rows={4}
              value={rejectObs}
              onChange={(e) => setRejectObs(e.target.value)}
              placeholder="Descreva detalhadamente os pontos que precisam ser corrigidos pelo projetista..."
              className="input-base text-sm"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
