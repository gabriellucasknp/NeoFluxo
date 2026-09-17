import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  Building2,
  Wrench,
  Calculator,
  ClipboardCheck,
  FileCheck,
  Plus,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Send,
  Loader2,
} from 'lucide-react';
import { Stepper } from '@/components/ui/Stepper';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/FormFields';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge, EnquadramentoBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  calculateProjectDemand,
  formatKw,
  getEnquadramentoLabel,
  DEMAND_LIMIT_KW,
} from '@/services/calcEngine';
import { mockTransformers } from '@/data/mockData';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import type {
  ProjectData,
  ConsumerUnitGroup,
  UnitLoad,
  ServiceLoad,
  SubestacaoConfig,
  Project,
  CalcResult,
  LoadType,
} from '@/types';

const baseSteps = [
  'Dados do Projeto',
  'Unidades Consumidoras',
  'Cargas de Serviço',
  'Cálculo e Enquadramento',
  'Revisão',
  'Atestado',
];

const stepIcons = [
  <FolderPlus className="h-4 w-4" />,
  <Building2 className="h-4 w-4" />,
  <Wrench className="h-4 w-4" />,
  <Calculator className="h-4 w-4" />,
  <ClipboardCheck className="h-4 w-4" />,
  <FileCheck className="h-4 w-4" />,
];

const loadTypeOptions: { value: LoadType; label: string }[] = [
  { value: 'iluminacao', label: 'Iluminação' },
  { value: 'tug', label: 'TUG — Tomada de Uso Geral' },
  { value: 'tue', label: 'TUE — Tomada de Uso Específico' },
  { value: 'motor', label: 'Motor' },
  { value: 'outros', label: 'Outras Cargas' },
];

const serviceCategoryOptions = [
  { value: 'elevadores', label: 'Elevadores' },
  { value: 'bombas', label: 'Bombas' },
  { value: 'motores', label: 'Motores' },
  { value: 'portoes', label: 'Portões Automáticos' },
  { value: 'seguranca', label: 'Sistemas de Segurança' },
  { value: 'iluminacao_comum', label: 'Iluminação de Áreas Comuns' },
  { value: 'outros', label: 'Outras Cargas' },
];

const DRAFT_KEY = 'neofluxo_novo_projeto_draft';

let idCounter = 0;
const genId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

export function NovoProjetoPage() {
  const navigate = useNavigate();
  const { addProject } = useProjects();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedProjectCode, setSubmittedProjectCode] = useState('');
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [projectData, setProjectData] = useState<ProjectData>({
    name: '', address: '', number: '', complement: '', neighborhood: '',
    city: '', cep: '', document: '', artNumber: '', technicalResponsible: '',
    observations: '',
  });

  const [units, setUnits] = useState<ConsumerUnitGroup[]>([]);
  const [serviceLoads, setServiceLoads] = useState<ServiceLoad[]>([]);
  const [subestacao, setSubestacao] = useState<SubestacaoConfig | undefined>(undefined);
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);

  // Carrega rascunho do localStorage no mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.projectData) setProjectData(draft.projectData);
        if (Array.isArray(draft.units)) setUnits(draft.units);
        if (Array.isArray(draft.serviceLoads)) setServiceLoads(draft.serviceLoads);
        if (draft.subestacao !== undefined) setSubestacao(draft.subestacao);
        if (draft.calcResult !== undefined) setCalcResult(draft.calcResult);
        if (typeof draft.step === 'number') setStep(draft.step);
      }
    } catch {
      // ignora erro de parse
    }
  }, []);

  // Salva o objeto do formulário no localStorage toda vez que ele mudar
  useEffect(() => {
    try {
      const draft = { projectData, units, serviceLoads, subestacao, calcResult, step };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignora erro de quota
    }
  }, [projectData, units, serviceLoads, subestacao, calcResult, step]);

  const liveCalc = useMemo(() => {
    if (units.length === 0 && serviceLoads.length === 0) return null;
    return calculateProjectDemand(units, serviceLoads);
  }, [units, serviceLoads]);

  const needsSubstation = liveCalc?.needsSubstation ?? false;

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!projectData.name) errors.name = 'Nome do projeto é obrigatório';
    if (!projectData.address) errors.address = 'Endereço é obrigatório';
    if (!projectData.number) errors.number = 'Número é obrigatório';
    if (!projectData.neighborhood) errors.neighborhood = 'Bairro é obrigatório';
    if (!projectData.city) errors.city = 'Cidade é obrigatória';
    if (!projectData.cep) errors.cep = 'CEP é obrigatório';
    if (!projectData.document) errors.document = 'CNPJ/CPF é obrigatório';
    if (!projectData.technicalResponsible) errors.technicalResponsible = 'Responsável técnico é obrigatório';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;

    if (step === 3) {
      // Perform calculation with animation
      setCalculating(true);
      setTimeout(() => {
        const result = calculateProjectDemand(units, serviceLoads);
        setCalcResult(result);
        if (result.needsSubstation && !subestacao) {
          setSubestacao({
            transformadorId: '',
            transformadorLabel: '',
            potenciaNominal: 0,
            quantidade: 1,
            configuracao: '',
            observacoes: '',
          });
        }
        setCalculating(false);
        setStep(4);
      }, 1500);
      return;
    }

    setStep((s) => Math.min(s + 1, baseSteps.length - 1));
  };

  const handlePrev = () => setStep((s) => Math.max(s - 1, 0));

  // Unit management
  const addUnit = () => {
    const newUnit: ConsumerUnitGroup = {
      id: genId('unit'),
      name: `Grupo ${units.length + 1}`,
      unitType: 'Residencial',
      unitCount: 1,
      tugCount: 0,
      tueCount: 0,
      lightingPoints: 0,
      loads: [
        { id: genId('load'), type: 'iluminacao', label: 'Iluminação', quantity: 1, powerPerUnit: 100 },
        { id: genId('load'), type: 'tug', label: 'TUG', quantity: 1, powerPerUnit: 100 },
      ],
    };
    setUnits([...units, newUnit]);
    setExpandedUnit(newUnit.id);
  };

  const duplicateUnit = (id: string) => {
    const unit = units.find((u) => u.id === id);
    if (!unit) return;
    const copy: ConsumerUnitGroup = {
      ...unit,
      id: genId('unit'),
      name: `${unit.name} (cópia)`,
      loads: unit.loads.map((l) => ({ ...l, id: genId('load') })),
    };
    setUnits([...units, copy]);
  };

  const deleteUnit = (id: string) => {
    setUnits(units.filter((u) => u.id !== id));
  };

  const updateUnit = (id: string, updates: Partial<ConsumerUnitGroup>) => {
    setUnits(units.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };

  const addLoadToUnit = (unitId: string) => {
    const newLoad: UnitLoad = { id: genId('load'), type: 'tug', label: 'Nova Carga', quantity: 1, powerPerUnit: 100 };
    setUnits(units.map((u) => (u.id === unitId ? { ...u, loads: [...u.loads, newLoad] } : u)));
  };

  const updateLoad = (unitId: string, loadId: string, updates: Partial<UnitLoad>) => {
    setUnits(units.map((u) =>
      u.id === unitId
        ? { ...u, loads: u.loads.map((l) => (l.id === loadId ? { ...l, ...updates } : l)) }
        : u,
    ));
  };

  const deleteLoad = (unitId: string, loadId: string) => {
    setUnits(units.map((u) =>
      u.id === unitId ? { ...u, loads: u.loads.filter((l) => l.id !== loadId) } : u,
    ));
  };

  // Service load management
  const addServiceLoad = () => {
    const newLoad: ServiceLoad = {
      id: genId('svc'),
      category: 'motores',
      name: 'Novo equipamento',
      quantity: 1,
      power: 1000,
    };
    setServiceLoads([...serviceLoads, newLoad]);
  };

  const updateServiceLoad = (id: string, updates: Partial<ServiceLoad>) => {
    setServiceLoads(serviceLoads.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteServiceLoad = (id: string) => {
    setServiceLoads(serviceLoads.filter((s) => s.id !== id));
  };

  const handleSubmit = () => {
    const projectCode = `PRJ-2026-${String(Date.now()).slice(-3)}`;
    const now = new Date().toISOString().split('T')[0];
    const result = calcResult || calculateProjectDemand(units, serviceLoads);

    const newProject: Project = {
      id: genId('proj'),
      code: projectCode,
      data: projectData,
      units,
      serviceLoads,
      subestacao: result.needsSubstation ? subestacao : undefined,
      calcResult: result,
      status: 'em_analise',
      createdAt: now,
      submittedAt: now,
      projetistaId: user?.id || '',
      projetistaName: user?.name || '',
      normaVersion: 'V1.0',
      history: [
        { id: genId('h'), date: now, action: 'Projeto criado', user: user?.name || '' },
        { id: genId('h'), date: now, action: 'Cálculo realizado', user: 'Sistema', detail: `Demanda: ${formatKw(result.calculatedDemand)} — ${result.normaAplicada}` },
        { id: genId('h'), date: now, action: 'Enviado para análise', user: user?.name || '' },
        { id: genId('h'), date: now, action: 'Projeto em análise', user: 'Sistema' },
      ],
    };

    addProject(newProject);
    setSubmittedProjectCode(projectCode);
    setSubmitSuccess(true);
    setShowSubmitModal(false);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignora erro
    }
  };

  // ---- Render steps ----

  const renderStep1 = () => (
    <Card>
      <CardHeader
        title="Dados do Projeto"
        subtitle="Informe os dados de identificação e localização do projeto."
        icon={<FolderPlus className="h-5 w-5" />}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Nome / Identificação do Projeto"
            required
            value={projectData.name}
            onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
            error={formErrors.name}
            placeholder="Ex: Residencial Aurora — Edifício A"
          />
        </div>
        <Input
          label="Endereço"
          required
          value={projectData.address}
          onChange={(e) => setProjectData({ ...projectData, address: e.target.value })}
          error={formErrors.address}
          placeholder="Rua / Avenida"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Número"
            required
            value={projectData.number}
            onChange={(e) => setProjectData({ ...projectData, number: e.target.value })}
            error={formErrors.number}
          />
          <Input
            label="Complemento"
            value={projectData.complement}
            onChange={(e) => setProjectData({ ...projectData, complement: e.target.value })}
          />
        </div>
        <Input
          label="Bairro"
          required
          value={projectData.neighborhood}
          onChange={(e) => setProjectData({ ...projectData, neighborhood: e.target.value })}
          error={formErrors.neighborhood}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cidade"
            required
            value={projectData.city}
            onChange={(e) => setProjectData({ ...projectData, city: e.target.value })}
            error={formErrors.city}
          />
          <Input
            label="CEP"
            required
            value={projectData.cep}
            onChange={(e) => setProjectData({ ...projectData, cep: e.target.value })}
            error={formErrors.cep}
            placeholder="00000-000"
          />
        </div>
        <Input
          label="CNPJ / CPF"
          required
          value={projectData.document}
          onChange={(e) => setProjectData({ ...projectData, document: e.target.value })}
          error={formErrors.document}
          placeholder="00.000.000/0000-00"
        />
        <Input
          label="Número da ART/TRT"
          value={projectData.artNumber}
          onChange={(e) => setProjectData({ ...projectData, artNumber: e.target.value })}
          placeholder="ART-2026-00000"
        />
        <div className="sm:col-span-2">
          <Input
            label="Responsável Técnico"
            required
            value={projectData.technicalResponsible}
            onChange={(e) => setProjectData({ ...projectData, technicalResponsible: e.target.value })}
            error={formErrors.technicalResponsible}
            placeholder="Eng. Nome — CREA 00000"
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="Observações"
            rows={3}
            value={projectData.observations}
            onChange={(e) => setProjectData({ ...projectData, observations: e.target.value })}
            placeholder="Informações adicionais sobre o projeto..."
          />
        </div>
      </div>
    </Card>
  );

  const renderStep2 = () => {
    const unitCalc = (unit: ConsumerUnitGroup) => {
      const installed = unit.loads.reduce((sum, l) => sum + l.quantity * l.powerPerUnit, 0);
      return {
        installedW: installed,
        totalInstalledW: installed * unit.unitCount,
        totalInstalledKw: (installed * unit.unitCount) / 1000,
      };
    };

    return (
      <div className="space-y-4">
        <Alert type="info" title="Levantamento de Múltiplas Unidades Consumidoras">
          Cadastre grupos de unidades consumidoras (ex: "10 apartamentos idênticos").
          O sistema aplica automaticamente os fatores de demanda da DIS-NOR-030 — você não precisa calcular manualmente.
        </Alert>

        <Card>
          <div className="flex items-center justify-between">
            <CardHeader
              title="Unidades Consumidoras"
              subtitle="Adicione grupos de unidades com suas cargas."
              icon={<Building2 className="h-5 w-5" />}
            />
            <Button icon={<Plus className="h-4 w-4" />} onClick={addUnit} size="sm">
              Adicionar Grupo
            </Button>
          </div>

          {units.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">Nenhuma unidade cadastrada.</p>
              <p className="text-xs text-slate-400">Clique em "Adicionar Grupo" para começar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {units.map((unit) => {
                const calc = unitCalc(unit);
                const isExpanded = expandedUnit === unit.id;
                return (
                  <div key={unit.id} className="rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between gap-3 p-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setExpandedUnit(isExpanded ? null : unit.id)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <div>
                          <p className="font-medium text-slate-800">{unit.name}</p>
                          <p className="text-xs text-slate-500">
                            {unit.unitCount} unidade(s) · {unit.unitType} · {formatKw(calc.totalInstalledKw)} instalados
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => duplicateUnit(unit.id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Duplicar">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteUnit(unit.id)} className="rounded-lg p-2 text-slate-400 hover:bg-danger-50 hover:text-danger-600" title="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 p-4">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <Input
                            label="Nome do Grupo"
                            value={unit.name}
                            onChange={(e) => updateUnit(unit.id, { name: e.target.value })}
                          />
                          <Input
                            label="Quantidade de Unidades"
                            type="number"
                            min={1}
                            value={unit.unitCount}
                            onChange={(e) => updateUnit(unit.id, { unitCount: Math.max(1, parseInt(e.target.value) || 1) })}
                          />
                          <Select
                            label="Tipo de Unidade"
                            value={unit.unitType}
                            onChange={(e) => updateUnit(unit.id, { unitType: e.target.value })}
                          >
                            <option>Residencial</option>
                            <option>Comercial</option>
                            <option>Industrial</option>
                            <option>Misto</option>
                          </Select>
                          <Input
                            label="Pontos de Iluminação"
                            type="number"
                            min={0}
                            value={unit.lightingPoints}
                            onChange={(e) => updateUnit(unit.id, { lightingPoints: parseInt(e.target.value) || 0 })}
                          />
                        </div>

                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">Cargas da Unidade</p>
                            <Button size="sm" variant="outline" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => addLoadToUnit(unit.id)}>
                              Adicionar Carga
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {unit.loads.map((load) => (
                              <div key={load.id} className="grid grid-cols-12 items-end gap-2 rounded-lg bg-slate-50 p-3">
                                <div className="col-span-12 sm:col-span-3">
                                  <Select
                                    label="Tipo"
                                    value={load.type}
                                    onChange={(e) => {
                                      const val = e.target.value as LoadType;
                                      const opt = loadTypeOptions.find((o) => o.value === val);
                                      updateLoad(unit.id, load.id, { type: val, label: opt?.label || load.label });
                                    }}
                                  >
                                    {loadTypeOptions.map((o) => (
                                      <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                  </Select>
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                  <Input
                                    label="Descrição"
                                    value={load.label}
                                    onChange={(e) => updateLoad(unit.id, load.id, { label: e.target.value })}
                                  />
                                </div>
                                <div className="col-span-3 sm:col-span-2">
                                  <Input
                                    label="Qtd."
                                    type="number"
                                    min={1}
                                    value={load.quantity}
                                    onChange={(e) => updateLoad(unit.id, load.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                  />
                                </div>
                                <div className="col-span-3 sm:col-span-3">
                                  <Input
                                    label="Potência (W)"
                                    type="number"
                                    min={0}
                                    value={load.powerPerUnit}
                                    onChange={(e) => updateLoad(unit.id, load.id, { powerPerUnit: Math.max(0, parseInt(e.target.value) || 0) })}
                                  />
                                </div>
                                <div className="col-span-12 sm:col-span-1 flex justify-end">
                                  <button
                                    onClick={() => deleteLoad(unit.id, load.id)}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-danger-50 hover:text-danger-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Pot. instalada/unidade</p>
                            <p className="text-lg font-semibold text-slate-800">{(calc.installedW / 1000).toFixed(2)} kW</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Nº de unidades</p>
                            <p className="text-lg font-semibold text-slate-800">{unit.unitCount}</p>
                          </div>
                          <div className="rounded-lg bg-neo-50 p-3">
                            <p className="text-xs text-neo-600">Pot. total do grupo</p>
                            <p className="text-lg font-semibold text-neo-700">{formatKw(calc.totalInstalledKw)}</p>
                          </div>
                          <div className="rounded-lg bg-amber-50 p-3">
                            <p className="text-xs text-amber-600">Demanda (estimada)</p>
                            <p className="text-lg font-semibold text-amber-700">{formatKw(calc.totalInstalledKw * 0.7)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Summary */}
        {units.length > 0 && (
          <Card className="bg-slate-50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-500">Total de unidades</p>
                <p className="text-xl font-bold text-slate-800">{units.reduce((s, u) => s + u.unitCount, 0)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Potência instalada</p>
                <p className="text-xl font-bold text-slate-800">{formatKw(liveCalc?.totalInstalledPower || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Demanda parcial</p>
                <p className="text-xl font-bold text-neo-700">{formatKw(liveCalc?.calculatedDemand || 0)}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
      <div className="space-y-4">
        <Alert type="info" title="Cargas de Serviço / Condomínio">
          Cadastre as cargas comuns (elevadores, bombas, motores, etc.).
          O sistema aplica automaticamente as regras de partida de motores, agrupamento, demanda e simultaneidade da DIS-NOR-030.
        </Alert>

        <Card>
          <div className="flex items-center justify-between">
            <CardHeader
              title="Cargas de Serviço"
              subtitle="Equipamentos e sistemas comuns do empreendimento."
              icon={<Wrench className="h-5 w-5" />}
            />
            <Button icon={<Plus className="h-4 w-4" />} onClick={addServiceLoad} size="sm">
              Adicionar Carga
            </Button>
          </div>

          {serviceLoads.length === 0 ? (
            <div className="py-12 text-center">
              <Wrench className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">Nenhuma carga de serviço cadastrada.</p>
              <p className="text-xs text-slate-400">Adicione elevadores, bombas, motores e outros equipamentos comuns.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {serviceLoads.map((load) => (
                <div key={load.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Select
                      label="Categoria"
                      value={load.category}
                      onChange={(e) => updateServiceLoad(load.id, { category: e.target.value as ServiceLoad['category'] })}
                    >
                      {serviceCategoryOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </Select>
                    <Input
                      label="Nome do Equipamento"
                      value={load.name}
                      onChange={(e) => updateServiceLoad(load.id, { name: e.target.value })}
                    />
                    <Input
                      label="Quantidade"
                      type="number"
                      min={1}
                      value={load.quantity}
                      onChange={(e) => updateServiceLoad(load.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    />
                    <Input
                      label="Potência (W)"
                      type="number"
                      min={0}
                      value={load.power}
                      onChange={(e) => updateServiceLoad(load.id, { power: Math.max(0, parseInt(e.target.value) || 0) })}
                    />
                  </div>

                  {(load.category === 'motores' || load.category === 'elevadores' || load.category === 'bombas') && (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Select
                        label="Tipo de Motor"
                        value={load.motorType || ''}
                        onChange={(e) => updateServiceLoad(load.id, { motorType: e.target.value })}
                      >
                        <option value="">Selecione...</option>
                        <option>Monofásico</option>
                        <option>Trifásico</option>
                      </Select>
                      <Input
                        label="Corrente (A)"
                        type="number"
                        value={load.current || ''}
                        onChange={(e) => updateServiceLoad(load.id, { current: parseInt(e.target.value) || undefined })}
                      />
                      <Select
                        label="Tipo de Partida"
                        value={load.startType || ''}
                        onChange={(e) => updateServiceLoad(load.id, { startType: e.target.value })}
                      >
                        <option value="">Selecione...</option>
                        <option>Direta</option>
                        <option>Estrela-Triângulo</option>
                        <option>Soft Starter</option>
                        <option>Inversor</option>
                      </Select>
                      <Input
                        label="Observações"
                        value={load.notes || ''}
                        onChange={(e) => updateServiceLoad(load.id, { notes: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Potência total: <span className="font-medium text-slate-800">{((load.quantity * load.power) / 1000).toFixed(2)} kW</span>
                    </div>
                    <button
                      onClick={() => deleteServiceLoad(load.id)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-danger-600 hover:bg-danger-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {serviceLoads.length > 0 && (
          <Card className="bg-slate-50">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Pot. instalada (serviço)</p>
                <p className="text-lg font-semibold text-slate-800">{formatKw(liveCalc?.totalInstalledPower ? liveCalc.totalInstalledPower - (units.reduce((s, u) => s + u.loads.reduce((sum, l) => sum + l.quantity * l.powerPerUnit * u.unitCount, 0), 0) / 1000) : 0)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Demanda (serviço)</p>
                <p className="text-lg font-semibold text-slate-800">{formatKw(liveCalc?.serviceDemand || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Demanda total do projeto</p>
                <p className="text-lg font-semibold text-neo-700">{formatKw(liveCalc?.calculatedDemand || 0)}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    );

  const renderStep4 = () => {
    if (calculating) {
      return (
        <Card className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neo-50">
                <Loader2 className="h-10 w-10 animate-spin text-neo-600" />
              </div>
              <Zap className="absolute -right-2 -top-2 h-7 w-7 text-amber-500" fill="currentColor" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-slate-800">Calculando demanda...</h3>
            <p className="mt-1 text-sm text-slate-500">Aplicando fatores da DIS-NOR-030 e determinando enquadramento.</p>
          </div>
        </Card>
      );
    }

    if (!calcResult) {
      return (
        <Card className="py-12 text-center">
          <Calculator className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">Clique em "Continuar" para realizar o cálculo.</p>
        </Card>
      );
    }

    const isBaixa = calcResult.enquadramento === 'baixa_tensao';

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Resultado do Cálculo"
            subtitle="Cálculo automático de demanda e enquadramento normativo."
            icon={<Calculator className="h-5 w-5" />}
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Potência instalada total</p>
              <p className="mt-1 text-xl font-bold text-slate-800">{formatKw(calcResult.totalInstalledPower)}</p>
            </div>
            <div className="rounded-lg border border-neo-200 bg-neo-50 p-4">
              <p className="text-xs text-neo-600">Demanda calculada</p>
              <p className="mt-1 text-xl font-bold text-neo-700">{formatKw(calcResult.calculatedDemand)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Quantidade de unidades</p>
              <p className="mt-1 text-xl font-bold text-slate-800">{calcResult.unitCount}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Demanda das unidades</p>
              <p className="mt-1 text-xl font-bold text-slate-800">{formatKw(calcResult.unitDemand)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Demanda das áreas comuns</p>
              <p className="mt-1 text-xl font-bold text-slate-800">{formatKw(calcResult.serviceDemand)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Norma aplicada</p>
              <p className="mt-1 text-lg font-bold text-slate-800">{calcResult.normaAplicada}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Enquadramento</p>
              <div className="mt-1"><EnquadramentoBadge enquadramento={calcResult.enquadramento} /></div>
            </div>
          </div>
        </Card>

        {isBaixa ? (
          <Alert type="success" title="Projeto enquadrado em Baixa Tensão">
            <div className="space-y-1">
              <p>Enquadramento: <strong>Baixa Tensão</strong></p>
              <p>Norma aplicada: <strong>DIS-NOR-030</strong></p>
              <p>A demanda calculada ({formatKw(calcResult.calculatedDemand)}) está dentro do limite de {DEMAND_LIMIT_KW} kW. O projeto seguirá o fluxo simplificado da DIS-NOR-030.</p>
            </div>
          </Alert>
        ) : (
          <Alert type="warning" title="Projeto enquadrado em Média Tensão">
            <div className="space-y-1">
              <p>Enquadramento: <strong>Média Tensão</strong></p>
              <p>Norma aplicada: <strong>DIS-NOR-053</strong></p>
              <p>A demanda calculada ({formatKw(calcResult.calculatedDemand)}) ultrapassa o limite de {DEMAND_LIMIT_KW} kW. O projeto deverá seguir o procedimento previsto na DIS-NOR-053, incluindo o dimensionamento da subestação.</p>
            </div>
          </Alert>
        )}

        {/* Substation step for >75kW */}
        {calcResult.needsSubstation && subestacao && (
          <Card>
            <CardHeader
              title="Dimensionamento da Subestação"
              subtitle="DIS-NOR-053 — Configuração da subestação"
              icon={<Building2 className="h-5 w-5" />}
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-neo-50 p-3 sm:col-span-2">
                <p className="text-xs text-neo-600">Demanda calculada</p>
                <p className="text-lg font-bold text-neo-700">{formatKw(calcResult.calculatedDemand)}</p>
              </div>
              <Select
                label="Transformador recomendado"
                value={subestacao.transformadorId}
                onChange={(e) => {
                  const t = mockTransformers.find((t) => t.id === e.target.value);
                  setSubestacao({
                    ...subestacao,
                    transformadorId: e.target.value,
                    transformadorLabel: t?.label || '',
                    potenciaNominal: t?.powerKva || 0,
                  });
                }}
              >
                <option value="">Selecione...</option>
                {mockTransformers.filter((t) => t.active).map((t) => (
                  <option key={t.id} value={t.id}>{t.label} — {t.powerKva} kVA</option>
                ))}
              </Select>
              <Input
                label="Potência nominal (kVA)"
                type="number"
                value={subestacao.potenciaNominal || ''}
                onChange={(e) => setSubestacao({ ...subestacao, potenciaNominal: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="Quantidade de transformadores"
                type="number"
                min={1}
                value={subestacao.quantidade}
                onChange={(e) => setSubestacao({ ...subestacao, quantidade: Math.max(1, parseInt(e.target.value) || 1) })}
              />
              <Select
                label="Configuração da subestação"
                value={subestacao.configuracao}
                onChange={(e) => setSubestacao({ ...subestacao, configuracao: e.target.value })}
              >
                <option value="">Selecione...</option>
                <option>Simples ramificação</option>
                <option>Dupla ramificação</option>
                <option>Tripla ramificação</option>
              </Select>
              <div className="col-span-2 sm:col-span-3">
                <Textarea
                  label="Observações técnicas"
                  rows={2}
                  value={subestacao.observacoes}
                  onChange={(e) => setSubestacao({ ...subestacao, observacoes: e.target.value })}
                />
              </div>
            </div>
            {subestacao.transformadorId && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-success-50 p-3">
                <CheckCircle2 className="h-5 w-5 text-success-600" />
                <p className="text-sm font-medium text-success-700">
                  Dimensionamento compatível — {subestacao.transformadorLabel}
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    );
  };

  const renderStep5 = () => {
    if (!calcResult) return null;
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Revisão do Projeto"
            subtitle="Confira todos os dados antes de enviar para análise."
            icon={<ClipboardCheck className="h-5 w-5" />}
          />

          <div className="space-y-6">
            {/* Project data */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-700">Dados do Projeto</h4>
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 text-sm">
                <div><span className="text-slate-500">Nome: </span><span className="font-medium text-slate-800">{projectData.name}</span></div>
                <div><span className="text-slate-500">Endereço: </span><span className="font-medium text-slate-800">{projectData.address}, {projectData.number}</span></div>
                <div><span className="text-slate-500">Bairro: </span><span className="font-medium text-slate-800">{projectData.neighborhood}</span></div>
                <div><span className="text-slate-500">Cidade: </span><span className="font-medium text-slate-800">{projectData.city}</span></div>
                <div><span className="text-slate-500">CEP: </span><span className="font-medium text-slate-800">{projectData.cep}</span></div>
                <div><span className="text-slate-500">CNPJ/CPF: </span><span className="font-medium text-slate-800">{projectData.document}</span></div>
                <div><span className="text-slate-500">ART/TRT: </span><span className="font-medium text-slate-800">{projectData.artNumber || '—'}</span></div>
                <div><span className="text-slate-500">Responsável: </span><span className="font-medium text-slate-800">{projectData.technicalResponsible}</span></div>
              </div>
            </div>

            {/* Units */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-700">Unidades Consumidoras</h4>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-2 font-semibold text-slate-600">Grupo</th>
                      <th className="px-4 py-2 font-semibold text-slate-600">Quantidade</th>
                      <th className="px-4 py-2 font-semibold text-slate-600">Potência instalada</th>
                      <th className="px-4 py-2 font-semibold text-slate-600">Demanda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {units.map((u) => {
                      const installed = u.loads.reduce((s, l) => s + l.quantity * l.powerPerUnit * u.unitCount, 0) / 1000;
                      return (
                        <tr key={u.id}>
                          <td className="px-4 py-2 font-medium text-slate-700">{u.name}</td>
                          <td className="px-4 py-2 text-slate-600">{u.unitCount}</td>
                          <td className="px-4 py-2 text-slate-600">{formatKw(installed)}</td>
                          <td className="px-4 py-2 text-slate-600">{formatKw(installed * 0.7)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Service loads */}
            {serviceLoads.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700">Cargas de Serviço</h4>
                <div className="rounded-lg bg-slate-50 p-4 text-sm">
                  {serviceLoads.map((s) => (
                    <div key={s.id} className="flex justify-between py-1">
                      <span className="text-slate-600">{s.name} ({s.quantity}x)</span>
                      <span className="font-medium text-slate-800">{formatKw((s.quantity * s.power) / 1000)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calculation result */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-700">Resultado do Cálculo</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Potência instalada</p>
                  <p className="text-lg font-bold text-slate-800">{formatKw(calcResult.totalInstalledPower)}</p>
                </div>
                <div className="rounded-lg bg-neo-50 p-3">
                  <p className="text-xs text-neo-600">Demanda calculada</p>
                  <p className="text-lg font-bold text-neo-700">{formatKw(calcResult.calculatedDemand)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Norma aplicada</p>
                  <p className="text-lg font-bold text-slate-800">{calcResult.normaAplicada}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Enquadramento</p>
                  <div className="mt-1"><EnquadramentoBadge enquadramento={calcResult.enquadramento} /></div>
                </div>
              </div>
            </div>

            {/* Substation */}
            {calcResult.needsSubstation && subestacao && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700">Subestação</h4>
                <div className="rounded-lg bg-slate-50 p-4 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-slate-500">Transformador: </span><span className="font-medium text-slate-800">{subestacao.transformadorLabel || '—'}</span></div>
                    <div><span className="text-slate-500">Potência nominal: </span><span className="font-medium text-slate-800">{subestacao.potenciaNominal} kVA</span></div>
                    <div><span className="text-slate-500">Quantidade: </span><span className="font-medium text-slate-800">{subestacao.quantidade}</span></div>
                    <div><span className="text-slate-500">Configuração: </span><span className="font-medium text-slate-800">{subestacao.configuracao || '—'}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-center">
          <Button size="lg" icon={<Send className="h-4 w-4" />} onClick={() => setShowSubmitModal(true)}>
            Enviar para Análise
          </Button>
        </div>
      </div>
    );
  };

  const renderStep6 = () => {
    if (!submitSuccess) {
      return (
        <Card className="py-12 text-center">
          <FileCheck className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">O atestado será gerado após a aprovação do projeto pela análise técnica.</p>
          <Button className="mt-4" onClick={() => navigate('/app/dashboard')}>
            Ir para o Dashboard
          </Button>
        </Card>
      );
    }

    return (
      <Card className="py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
          <CheckCircle2 className="h-10 w-10 text-success-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-800">Projeto enviado para análise!</h3>
        <p className="mt-1 text-sm text-slate-500">Código do projeto: <span className="font-bold text-neo-700">{submittedProjectCode}</span></p>
        <p className="text-sm text-slate-500">Seu projeto foi enviado para a equipe de análise da Neoenergia. Você acompanhará o status no dashboard.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('/app/dashboard')}>
            Ir para o Dashboard
          </Button>
          <Button onClick={() => navigate('/app/meus-projetos')}>
            Ver Meus Projetos
          </Button>
        </div>
      </Card>
    );
  };

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Novo Projeto</h1>
          <p className="text-sm text-slate-500">O sistema calcula automaticamente a demanda e o enquadramento normativo.</p>
        </div>
      </div>

      <Card>
        <Stepper
          steps={baseSteps}
          currentStep={step}
          extraStep={needsSubstation && step >= 3 ? { label: 'Subestação', active: true } : null}
        />
        {stepRenderers[step]()}

        {/* Navigation */}
        {step < 5 && (
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={handlePrev}
              disabled={step === 0 || calculating}
            >
              Voltar
            </Button>
            <Button
              icon={step === 4 ? <Send className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              onClick={handleNext}
              disabled={calculating}
            >
              {step === 0 ? 'Continuar' : step === 3 ? 'Calcular e Continuar' : step === 4 ? 'Revisar' : 'Continuar'}
            </Button>
          </div>
        )}
        <p className="mt-4 text-center text-xs text-slate-400">Rascunho salvo localmente</p>
      </Card>

      {/* Submit confirmation modal */}
      <Modal
        open={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Confirmar envio para análise"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowSubmitModal(false)}>Cancelar</Button>
            <Button icon={<Send className="h-4 w-4" />} onClick={handleSubmit}>Confirmar Envio</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Ao enviar o projeto para análise, o sistema irá:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-500" /> Validar todos os campos</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-500" /> Registrar data e hora do envio</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-500" /> Gerar código único do projeto</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-500" /> Alterar status para "Em análise"</li>
          </ul>
          <div className="rounded-lg bg-neo-50 p-3">
            <p className="text-sm text-neo-700">
              <strong>Demanda calculada:</strong> {calcResult && formatKw(calcResult.calculatedDemand)}
            </p>
            <p className="text-sm text-neo-700">
              <strong>Norma aplicada:</strong> {calcResult?.normaAplicada}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
