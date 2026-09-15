export type UserRole = 'projetista' | 'analista' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

export type ProjectStatus =
  | 'rascunho'
  | 'enviado_analise'
  | 'em_analise'
  | 'aprovado'
  | 'reprovado';

export type Enquadramento = 'baixa_tensao' | 'media_tensao';

export type NormaAplicada = 'DIS-NOR-030' | 'DIS-NOR-053';

export type LoadType = 'iluminacao' | 'tug' | 'tue' | 'motor' | 'bomba' | 'elevador' | 'portao' | 'seguranca' | 'iluminacao_comum' | 'outros';

export interface UnitLoad {
  id: string;
  type: LoadType;
  label: string;
  quantity: number;
  powerPerUnit: number; // watts
}

export interface ConsumerUnitGroup {
  id: string;
  name: string;
  unitType: string;
  unitCount: number;
  tugCount: number;
  tueCount: number;
  lightingPoints: number;
  loads: UnitLoad[];
}

export interface ServiceLoad {
  id: string;
  category: 'elevadores' | 'bombas' | 'motores' | 'portoes' | 'seguranca' | 'iluminacao_comum' | 'outros';
  name: string;
  quantity: number;
  power: number; // watts
  motorType?: string;
  current?: number; // amperes
  startType?: string;
  notes?: string;
}

export interface SubestacaoConfig {
  transformadorId: string;
  transformadorLabel: string;
  potenciaNominal: number; // kVA
  quantidade: number;
  configuracao: string;
  observacoes: string;
}

export interface ProjectData {
  name: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  cep: string;
  document: string; // CNPJ/CPF
  artNumber: string;
  technicalResponsible: string;
  observations: string;
}

export interface CalcResult {
  totalInstalledPower: number; // kW
  calculatedDemand: number; // kW
  unitCount: number;
  unitDemand: number; // kW
  serviceDemand: number; // kW
  enquadramento: Enquadramento;
  normaAplicada: NormaAplicada;
  needsSubstation: boolean;
}

export interface HistoryEntry {
  id: string;
  date: string;
  action: string;
  user: string;
  detail?: string;
}

export interface RejectionInfo {
  reason: string;
  observations: string;
  analyst: string;
  date: string;
}

export interface Atestado {
  id: string;
  code: string;
  projectId: string;
  issueDate: string;
  uniqueIdentifier: string;
}

export interface Project {
  id: string;
  code: string;
  data: ProjectData;
  units: ConsumerUnitGroup[];
  serviceLoads: ServiceLoad[];
  subestacao?: SubestacaoConfig;
  calcResult: CalcResult;
  status: ProjectStatus;
  createdAt: string;
  submittedAt?: string;
  analyzedAt?: string;
  approvedAt?: string;
  rejection?: RejectionInfo;
  history: HistoryEntry[];
  atestado?: Atestado;
  projetistaId: string;
  projetistaName: string;
  normaVersion: string;
}

export interface DemandFactor {
  id: string;
  category: LoadType | string;
  label: string;
  minPower: number; // W
  maxPower: number; // W (0 = no limit)
  factor: number; // 0-1
  active: boolean;
}

export interface NormVersion {
  id: string;
  norma: NormaAplicada;
  version: string;
  startDate: string;
  updatedAt: string;
  responsible: string;
  active: boolean;
}

export interface TransformerModel {
  id: string;
  label: string;
  powerKva: number;
  voltage: string;
  active: boolean;
}

export interface LoadCategory {
  id: string;
  name: string;
  type: LoadType;
  defaultPower: number;
  configurable: boolean;
}

export interface SystemLog {
  id: string;
  date: string;
  user: string;
  action: string;
  entity: string;
}
