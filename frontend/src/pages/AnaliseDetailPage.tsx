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
import type { Project } from '@/types';

const rejectionReasons = [
  'Divergência com a planta',
  'Dados incorretos',
  'Documentação incompleta',
  'Carga não informada',
  'Informações inconsistentes',
  'Outro',
];

export function AnaliseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, updateProject } = useProjects();
  const { user } = useAuth();
  const project = id ? getProject(id) : undefined;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectObs, setRejectObs] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!project) {
    return (
      <Card>
        <EmptyState
          icon={<AlertTriangle className="h-12 w-12" />}
          title="Projeto não encontrado"
          action={<Button onClick={() => navigate('/app/analise')}>Voltar</Button>}
        />
      </Card>
    );
  }

  const isPending = project.status === 'enviado_analise' || project.status === 'em_analise';
  const now = new Date().toISOString().split('T')[0];

  const handleApprove = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const atestadoCode = `AT-2026-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;
      const uniqueId = `NEO-AT-2026-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

      const updated: Partial<Project> = {
        status: 'aprovado',
        analyzedAt: now,
        approvedAt: now,
        atestado: {
          id: `a-${Date.now()}`,
          code: atestadoCode,
          projectId: project.id,
          issueDate: now,
          uniqueIdentifier: uniqueId,
        },
        history: [
          ...project.history,
          { id: `h-${Date.now()}`, date: now, action: 'Projeto aprovado', user: user?.name || '', detail: `Atestado: ${atestadoCode}` },
        ],
      };
      updateProject(project.id, updated);
      setSuccessMessage('Projeto aprovado com sucesso!');
      setShowApproveModal(false);
      setIsSubmitting(false);
      setTimeout(() => navigate('/app/analise'), 1000);
    }, 1500);
  };

  const handleReject = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const updated: Partial<Project> = {
        status: 'reprovado',
        analyzedAt: now,
        rejection: {
          reason: rejectReason,
          observations: rejectObs,
          analyst: user?.name || '',
          date: now,
        },
        history: [
          ...project.history,
          { id: `h-${Date.now()}`, date: now, action: 'Projeto reprovado', user: user?.name || '', detail: rejectReason },
        ],
      };
      updateProject(project.id, updated);
      setSuccessMessage('Projeto reprovado com sucesso!');
      setShowRejectModal(false);
      setIsSubmitting(false);
      setTimeout(() => navigate('/app/analise'), 1000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <Alert type="success" title={successMessage}>
          <p>Redirecionando para a lista de análises...</p>
        </Alert>
      )}
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{project.code}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-sm text-slate-500">{project.data.name} · Projetista: {project.projetistaName}</p>
          </div>
        </div>
      </div>

      {/* Highlighted calculation results */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-neo-200 bg-neo-50">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-neo-600" />
            <div>
              <p className="text-xs text-neo-600">Demanda calculada pelo sistema</p>
              <p className="text-2xl font-bold text-neo-700">{formatKw(project.calcResult.calculatedDemand)}</p>
            </div>
          </div>
        </Card>
        <Card className="border-slate-200">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-slate-600" />
            <div>
              <p className="text-xs text-slate-500">Norma aplicada</p>
              <p className="text-xl font-bold text-slate-800">{project.calcResult.normaAplicada}</p>
            </div>
          </div>
        </Card>
        <Card className="border-slate-200">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-slate-600" />
            <div>
              <p className="text-xs text-slate-500">Enquadramento automático</p>
              <div className="mt-1"><EnquadramentoBadge enquadramento={project.calcResult.enquadramento} /></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Existing rejection */}
      {project.rejection && (
        <Alert type="error" title={`Reprovado — ${project.rejection.reason}`}>
          <p>{project.rejection.observations}</p>
          <p className="mt-2 text-xs">Analisado por {project.rejection.analyst} em {new Date(project.rejection.date).toLocaleDateString('pt-BR')}</p>
        </Alert>
      )}

      {/* Espelho de Auditoria */}
      <Card>
        <CardHeader title="Espelho de Auditoria" subtitle="Conferência visual dos dados calculados pelo sistema contra a planta/documentação enviada." icon={<FileText className="h-5 w-5" />} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Potência instalada total</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{formatKw(project.calcResult.totalInstalledPower)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Demanda das unidades</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{formatKw(project.calcResult.unitDemand)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Demanda das áreas comuns</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{formatKw(project.calcResult.serviceDemand)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Nº de unidades</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{project.calcResult.unitCount}</p>
          </div>
        </div>
      </Card>

      {/* Project data */}
      <Card>
        <CardHeader title="Dados do Projeto" icon={<Building2 className="h-5 w-5" />} />
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {[
            { label: 'Nome', value: project.data.name },
            { label: 'Endereço', value: `${project.data.address}, ${project.data.number}` },
            { label: 'Bairro', value: project.data.neighborhood },
            { label: 'Cidade', value: project.data.city },
            { label: 'CEP', value: project.data.cep },
            { label: 'CNPJ/CPF', value: project.data.document },
            { label: 'ART/TRT', value: project.data.artNumber || '—' },
            { label: 'Responsável técnico', value: project.data.technicalResponsible },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="font-medium text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Units */}
      <Card padding="none">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-neo-600" />
            <h3 className="text-base font-semibold text-slate-800">Unidades Consumidoras</h3>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-5 py-3 font-semibold text-slate-600">Grupo</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Quantidade</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Potência instalada</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Cargas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {project.units.map((u) => {
                const installed = u.loads.reduce((s, l) => s + l.quantity * l.powerPerUnit * u.unitCount, 0) / 1000;
                return (
                  <tr key={u.id}>
                    <td className="px-5 py-3 font-medium text-slate-700">{u.name}</td>
                    <td className="px-5 py-3 text-slate-600">{u.unitCount}</td>
                    <td className="px-5 py-3 text-slate-600">{formatKw(installed)}</td>
                    <td className="px-5 py-3 text-slate-600">{u.loads.length} tipo(s)</td>
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
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Wrench className="h-5 w-5 text-neo-600" />
              <h3 className="text-base font-semibold text-slate-800">Cargas de Serviço</h3>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-5 py-3 font-semibold text-slate-600">Equipamento</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Categoria</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Qtd.</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Potência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {project.serviceLoads.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3 font-medium text-slate-700">{s.name}</td>
                    <td className="px-5 py-3 text-slate-600 capitalize">{s.category.replace('_', ' ')}</td>
                    <td className="px-5 py-3 text-slate-600">{s.quantity}</td>
                    <td className="px-5 py-3 text-slate-600">{formatKw((s.quantity * s.power) / 1000)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Substation */}
      {project.subestacao && (
        <Card>
          <CardHeader title="Subestação (DIS-NOR-053)" icon={<Building2 className="h-5 w-5" />} />
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div><span className="text-slate-500">Transformador: </span><span className="font-medium text-slate-800">{project.subestacao.transformadorLabel}</span></div>
            <div><span className="text-slate-500">Potência: </span><span className="font-medium text-slate-800">{project.subestacao.potenciaNominal} kVA</span></div>
            <div><span className="text-slate-500">Quantidade: </span><span className="font-medium text-slate-800">{project.subestacao.quantidade}</span></div>
            <div><span className="text-slate-500">Configuração: </span><span className="font-medium text-slate-800">{project.subestacao.configuracao}</span></div>
          </div>
        </Card>
      )}

      {/* Action buttons */}
      {isPending && (
        <div className="sticky bottom-4 flex justify-center gap-3">
          <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-card-hover">
            <Button variant="success" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setShowApproveModal(true)}>
              APROVAR PROJETO
            </Button>
            <Button variant="danger" icon={<XCircle className="h-4 w-4" />} onClick={() => setShowRejectModal(true)}>
              REPROVAR PROJETO
            </Button>
          </div>
        </div>
      )}

      {/* Approve modal */}
      <Modal
        open={showApproveModal}
        onClose={() => { if (!isSubmitting) setShowApproveModal(false); }}
        title="Confirmar aprovação"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowApproveModal(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="success" icon={<CheckCircle2 className="h-4 w-4" />} onClick={handleApprove} disabled={isSubmitting}>{isSubmitting ? 'Processando...' : 'Confirmar Aprovação'}</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Ao aprovar o projeto, o sistema irá:</p>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-500" /> Registrar o analista e a data/hora</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-500" /> Alterar status para "Aprovado"</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-500" /> Gerar o atestado digital com QR Code</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-500" /> Disponibilizar o atestado para o projetista</li>
          </ul>
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal
        open={showRejectModal}
        onClose={() => { if (!isSubmitting) setShowRejectModal(false); }}
        title="Motivo da reprovação"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRejectModal(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="danger" icon={<XCircle className="h-4 w-4" />} onClick={handleReject} disabled={!rejectReason || rejectObs.trim().length < 10 || isSubmitting}>{isSubmitting ? 'Processando...' : 'Confirmar Reprovação'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Motivo"
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          >
            <option value="">Selecione um motivo...</option>
            {rejectionReasons.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
          <Textarea
            label="Observações do analista"
            rows={4}
            value={rejectObs}
            onChange={(e) => setRejectObs(e.target.value)}
            placeholder="Descreva as correções necessárias..."
          />
        </div>
      </Modal>
    </div>
  );
}
