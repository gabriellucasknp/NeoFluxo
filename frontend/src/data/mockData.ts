import type {
  User,
  Project,
  DemandFactor,
  NormVersion,
  TransformerModel,
  LoadCategory,
  SystemLog,
} from '@/types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@neoenergia.com',
    role: 'projetista',
    department: 'Projetos Elétricos',
  },
  {
    id: 'u2',
    name: 'Ana Beatriz Silva',
    email: 'ana.silva@neoenergia.com',
    role: 'analista',
    department: 'Análise Técnica',
  },
  {
    id: 'u3',
    name: 'Roberto Fonseca',
    email: 'roberto.fonseca@neoenergia.com',
    role: 'admin',
    department: 'Engenharia',
  },
  {
    id: 'u4',
    name: 'Mariana Costa',
    email: 'mariana.costa@neoenergia.com',
    role: 'projetista',
    department: 'Projetos Elétricos',
  },
  {
    id: 'u5',
    name: 'João Pereira',
    email: 'joao.pereira@neoenergia.com',
    role: 'analista',
    department: 'Análise Técnica',
  },
];

export const mockNormVersions: NormVersion[] = [
  {
    id: 'nv1',
    norma: 'DIS-NOR-030',
    version: 'V1.0',
    startDate: '2026-01-15',
    updatedAt: '2026-01-15',
    responsible: 'Roberto Fonseca',
    active: true,
  },
  {
    id: 'nv2',
    norma: 'DIS-NOR-053',
    version: 'V1.0',
    startDate: '2026-01-15',
    updatedAt: '2026-01-15',
    responsible: 'Roberto Fonseca',
    active: true,
  },
];

export const mockDemandFactors: DemandFactor[] = [
  { id: 'df1', category: 'iluminacao', label: 'Iluminação — até 1000W', minPower: 0, maxPower: 1000, factor: 1.0, active: true },
  { id: 'df2', category: 'iluminacao', label: 'Iluminação — 1001W a 2000W', minPower: 1001, maxPower: 2000, factor: 0.8, active: true },
  { id: 'df3', category: 'iluminacao', label: 'Iluminação — 2001W a 3000W', minPower: 2001, maxPower: 3000, factor: 0.65, active: true },
  { id: 'df4', category: 'iluminacao', label: 'Iluminação — acima de 3000W', minPower: 3001, maxPower: 0, factor: 0.55, active: true },
  { id: 'df5', category: 'tug', label: 'TUG — até 1000W', minPower: 0, maxPower: 1000, factor: 1.0, active: true },
  { id: 'df6', category: 'tug', label: 'TUG — 1001W a 2000W', minPower: 1001, maxPower: 2000, factor: 0.8, active: true },
  { id: 'df7', category: 'tug', label: 'TUG — 2001W a 3000W', minPower: 2001, maxPower: 3000, factor: 0.6, active: true },
  { id: 'df8', category: 'tug', label: 'TUG — acima de 3000W', minPower: 3001, maxPower: 0, factor: 0.4, active: true },
  { id: 'df9', category: 'tue', label: 'TUE — fator único', minPower: 0, maxPower: 0, factor: 1.0, active: true },
  { id: 'df10', category: 'elevador', label: 'Elevador — 1 motor', minPower: 0, maxPower: 0, factor: 1.0, active: true },
  { id: 'df11', category: 'elevador', label: 'Elevador — 2 ou mais', minPower: 0, maxPower: 0, factor: 0.7, active: true },
  { id: 'df12', category: 'bomba', label: 'Bomba — fator de agrupamento', minPower: 0, maxPower: 0, factor: 0.85, active: true },
  { id: 'df13', category: 'motor', label: 'Motor — fator de demanda', minPower: 0, maxPower: 0, factor: 0.75, active: true },
  { id: 'df14', category: 'seguranca', label: 'Sistemas de segurança', minPower: 0, maxPower: 0, factor: 1.0, active: true },
  { id: 'df15', category: 'iluminacao_comum', label: 'Iluminação de áreas comuns', minPower: 0, maxPower: 0, factor: 0.9, active: true },
];

export const mockTransformers: TransformerModel[] = [
  { id: 't1', label: 'Transformador 1 — placeholder', powerKva: 75, voltage: '13.8kV / 380V', active: true },
  { id: 't2', label: 'Transformador 2 — placeholder', powerKva: 112.5, voltage: '13.8kV / 380V', active: true },
  { id: 't3', label: 'Transformador 3 — placeholder', powerKva: 150, voltage: '13.8kV / 380V', active: true },
  { id: 't4', label: 'Transformador 4 — placeholder', powerKva: 225, voltage: '13.8kV / 380V', active: true },
  { id: 't5', label: 'Transformador 5 — placeholder', powerKva: 300, voltage: '13.8kV / 380V', active: true },
];

export const mockLoadCategories: LoadCategory[] = [
  { id: 'lc1', name: 'Iluminação', type: 'iluminacao', defaultPower: 100, configurable: true },
  { id: 'lc2', name: 'TUG — Tomada de Uso Geral', type: 'tug', defaultPower: 100, configurable: true },
  { id: 'lc3', name: 'TUE — Tomada de Uso Específico', type: 'tue', defaultPower: 600, configurable: true },
  { id: 'lc4', name: 'Elevadores', type: 'elevador', defaultPower: 5000, configurable: true },
  { id: 'lc5', name: 'Bombas', type: 'bomba', defaultPower: 2000, configurable: true },
  { id: 'lc6', name: 'Motores', type: 'motor', defaultPower: 3000, configurable: true },
  { id: 'lc7', name: 'Portões Automáticos', type: 'portao', defaultPower: 500, configurable: true },
  { id: 'lc8', name: 'Sistemas de Segurança', type: 'seguranca', defaultPower: 800, configurable: true },
  { id: 'lc9', name: 'Iluminação de Áreas Comuns', type: 'iluminacao_comum', defaultPower: 150, configurable: true },
  { id: 'lc10', name: 'Outras Cargas', type: 'outros', defaultPower: 1000, configurable: true },
];

export const mockLogs: SystemLog[] = [
  { id: 'log1', date: '2026-08-26T09:15:00', user: 'Roberto Fonseca', action: 'Atualizou fator de demanda', entity: 'DIS-NOR-030' },
  { id: 'log2', date: '2026-08-26T10:30:00', user: 'Ana Beatriz Silva', action: 'Aprovou projeto', entity: 'PRJ-2026-001' },
  { id: 'log3', date: '2026-08-25T14:00:00', user: 'Carlos Mendes', action: 'Criou projeto', entity: 'PRJ-2026-003' },
  { id: 'log4', date: '2026-08-25T16:20:00', user: 'João Pereira', action: 'Reprovou projeto', entity: 'PRJ-2026-002' },
  { id: 'log5', date: '2026-08-24T11:00:00', user: 'Roberto Fonseca', action: 'Cadastrou transformador', entity: 'Transformadores' },
  { id: 'log6', date: '2026-08-24T13:45:00', user: 'Mariana Costa', action: 'Enviou projeto para análise', entity: 'PRJ-2026-005' },
];

const today = '2026-08-26';
const yesterday = '2026-08-25';
const dayBefore = '2026-08-24';

export const mockProjects: Project[] = [
  {
    id: 'p1',
    code: 'PRJ-2026-001',
    projetistaId: 'u1',
    projetistaName: 'Carlos Mendes',
    normaVersion: 'V1.0',
    status: 'aprovado',
    data: {
      name: 'Residencial Aurora — Edifício A',
      address: 'Av. Boa Viagem', number: '4500', complement: 'Torre A',
      neighborhood: 'Boa Viagem', city: 'Recife', cep: '51020-000',
      document: '12.345.678/0001-90', artNumber: 'ART-2026-00123',
      technicalResponsible: 'Eng. Carlos Mendes — CREA 12345', observations: 'Edifício residencial com 10 apartamentos tipo.',
    },
    units: [
      {
        id: 'u1', name: 'Apartamentos Tipo A', unitType: 'Residencial', unitCount: 10,
        tugCount: 8, tueCount: 2, lightingPoints: 6,
        loads: [
          { id: 'l1', type: 'iluminacao', label: 'Iluminação', quantity: 6, powerPerUnit: 100 },
          { id: 'l2', type: 'tug', label: 'TUG', quantity: 8, powerPerUnit: 100 },
          { id: 'l3', type: 'tue', label: 'TUE — Chuveiro', quantity: 1, powerPerUnit: 5500 },
          { id: 'l4', type: 'tue', label: 'TUE — Ar Condicionado', quantity: 1, powerPerUnit: 2000 },
        ],
      },
    ],
    serviceLoads: [
      { id: 'sl1', category: 'elevadores', name: 'Elevador Social', quantity: 1, power: 5000, motorType: 'Trifásico', current: 15, startType: 'Direta', notes: 'Elevador para 8 andares' },
      { id: 'sl2', category: 'bombas', name: 'Bomba Hidráulica', quantity: 2, power: 2000, motorType: 'Trifásico', current: 8, startType: 'Estrela-Triângulo' },
      { id: 'sl3', category: 'iluminacao_comum', name: 'Iluminação Hall e Corredores', quantity: 1, power: 1200 },
    ],
    calcResult: {
      totalInstalledPower: 98.0,
      calculatedDemand: 68.4,
      unitCount: 10,
      unitDemand: 60.0,
      serviceDemand: 8.4,
      enquadramento: 'baixa_tensao',
      normaAplicada: 'DIS-NOR-030',
      needsSubstation: false,
    },
    createdAt: dayBefore, submittedAt: dayBefore, analyzedAt: yesterday, approvedAt: today,
    history: [
      { id: 'h1', date: dayBefore, action: 'Projeto criado', user: 'Carlos Mendes' },
      { id: 'h2', date: dayBefore, action: 'Cálculo realizado', user: 'Sistema', detail: 'Demanda: 68.4 kW — DIS-NOR-030' },
      { id: 'h3', date: dayBefore, action: 'Enviado para análise', user: 'Carlos Mendes' },
      { id: 'h4', date: yesterday, action: 'Projeto em análise', user: 'Ana Beatriz Silva' },
      { id: 'h5', date: today, action: 'Projeto aprovado', user: 'Ana Beatriz Silva' },
    ],
    atestado: {
      id: 'a1', code: 'AT-2026-001', projectId: 'p1', issueDate: today,
      uniqueIdentifier: 'NEO-AT-2026-001-XK7M3P',
    },
  },
  {
    id: 'p2',
    code: 'PRJ-2026-002',
    projetistaId: 'u4',
    projetistaName: 'Mariana Costa',
    normaVersion: 'V1.0',
    status: 'reprovado',
    data: {
      name: 'Centro Comercial Plaza Norte',
      address: 'Rua do Sol', number: '230', complement: 'Lotes 1-12',
      neighborhood: 'Santo Amaro', city: 'Recife', cep: '50040-010',
      document: '98.765.432/0001-10', artNumber: 'ART-2026-00456',
      technicalResponsible: 'Eng. Mariana Costa — CREA 67890', observations: 'Centro comercial com 12 lojas.',
    },
    units: [
      {
        id: 'u2', name: 'Lojas Comerciais', unitType: 'Comercial', unitCount: 12,
        tugCount: 10, tueCount: 3, lightingPoints: 8,
        loads: [
          { id: 'l5', type: 'iluminacao', label: 'Iluminação', quantity: 8, powerPerUnit: 150 },
          { id: 'l6', type: 'tug', label: 'TUG', quantity: 10, powerPerUnit: 100 },
          { id: 'l7', type: 'tue', label: 'TUE — Ar Condicionado', quantity: 2, powerPerUnit: 3000 },
          { id: 'l8', type: 'tue', label: 'TUE — Freezer', quantity: 1, powerPerUnit: 1500 },
        ],
      },
    ],
    serviceLoads: [
      { id: 'sl4', category: 'elevadores', name: 'Elevador de Carga', quantity: 1, power: 7500, motorType: 'Trifásico', current: 22, startType: 'Direta' },
      { id: 'sl5', category: 'iluminacao_comum', name: 'Iluminação Praça', quantity: 1, power: 3000 },
    ],
    calcResult: {
      totalInstalledPower: 112.5,
      calculatedDemand: 82.1,
      unitCount: 12,
      unitDemand: 73.5,
      serviceDemand: 8.6,
      enquadramento: 'media_tensao',
      normaAplicada: 'DIS-NOR-053',
      needsSubstation: true,
    },
    subestacao: {
      transformadorId: 't2', transformadorLabel: 'Transformador 2 — placeholder',
      potenciaNominal: 112.5, quantidade: 1, configuracao: 'Simples ramificação',
      observacoes: 'Dimensionamento compatível com a demanda calculada.',
    },
    createdAt: dayBefore, submittedAt: dayBefore, analyzedAt: yesterday,
    rejection: {
      reason: 'Divergência com a planta',
      observations: 'A quantidade de TUGs informada no sistema não corresponde à planta elétrica enviada. Favor revisar o levantamento das unidades consumidoras.',
      analyst: 'João Pereira',
      date: yesterday,
    },
    history: [
      { id: 'h6', date: dayBefore, action: 'Projeto criado', user: 'Mariana Costa' },
      { id: 'h7', date: dayBefore, action: 'Cálculo realizado', user: 'Sistema', detail: 'Demanda: 82.1 kW — DIS-NOR-053' },
      { id: 'h8', date: dayBefore, action: 'Enviado para análise', user: 'Mariana Costa' },
      { id: 'h9', date: yesterday, action: 'Projeto em análise', user: 'João Pereira' },
      { id: 'h10', date: yesterday, action: 'Projeto reprovado', user: 'João Pereira', detail: 'Divergência com a planta' },
    ],
  },
  {
    id: 'p3',
    code: 'PRJ-2026-003',
    projetistaId: 'u1',
    projetistaName: 'Carlos Mendes',
    normaVersion: 'V1.0',
    status: 'em_analise',
    data: {
      name: 'Condomínio Vista Verde — Blocos B e C',
      address: 'Rua das Acácias', number: '78', complement: 'Blocos B e C',
      neighborhood: 'Casa Forte', city: 'Recife', cep: '52060-000',
      document: '45.678.901/0001-23', artNumber: 'ART-2026-00789',
      technicalResponsible: 'Eng. Carlos Mendes — CREA 12345', observations: 'Condomínio com 2 blocos de 16 apartamentos cada.',
    },
    units: [
      {
        id: 'u3', name: 'Apartamentos Bloco B', unitType: 'Residencial', unitCount: 16,
        tugCount: 8, tueCount: 2, lightingPoints: 6,
        loads: [
          { id: 'l9', type: 'iluminacao', label: 'Iluminação', quantity: 6, powerPerUnit: 100 },
          { id: 'l10', type: 'tug', label: 'TUG', quantity: 8, powerPerUnit: 100 },
          { id: 'l11', type: 'tue', label: 'TUE — Chuveiro', quantity: 1, powerPerUnit: 5500 },
          { id: 'l12', type: 'tue', label: 'TUE — Ar Condicionado', quantity: 1, powerPerUnit: 2000 },
        ],
      },
      {
        id: 'u4', name: 'Apartamentos Bloco C', unitType: 'Residencial', unitCount: 16,
        tugCount: 8, tueCount: 2, lightingPoints: 6,
        loads: [
          { id: 'l13', type: 'iluminacao', label: 'Iluminação', quantity: 6, powerPerUnit: 100 },
          { id: 'l14', type: 'tug', label: 'TUG', quantity: 8, powerPerUnit: 100 },
          { id: 'l15', type: 'tue', label: 'TUE — Chuveiro', quantity: 1, powerPerUnit: 5500 },
          { id: 'l16', type: 'tue', label: 'TUE — Ar Condicionado', quantity: 1, powerPerUnit: 2000 },
        ],
      },
    ],
    serviceLoads: [
      { id: 'sl6', category: 'elevadores', name: 'Elevador Bloco B', quantity: 1, power: 5000, motorType: 'Trifásico', current: 15, startType: 'Direta' },
      { id: 'sl7', category: 'elevadores', name: 'Elevador Bloco C', quantity: 1, power: 5000, motorType: 'Trifásico', current: 15, startType: 'Direta' },
      { id: 'sl8', category: 'bombas', name: 'Bomba Hidráulica', quantity: 4, power: 2000, motorType: 'Trifásico', current: 8, startType: 'Estrela-Triângulo' },
      { id: 'sl9', category: 'iluminacao_comum', name: 'Iluminação Comum', quantity: 1, power: 2500 },
    ],
    calcResult: {
      totalInstalledPower: 192.0,
      calculatedDemand: 132.8,
      unitCount: 32,
      unitDemand: 120.0,
      serviceDemand: 12.8,
      enquadramento: 'media_tensao',
      normaAplicada: 'DIS-NOR-053',
      needsSubstation: true,
    },
    subestacao: {
      transformadorId: 't3', transformadorLabel: 'Transformador 3 — placeholder',
      potenciaNominal: 150, quantidade: 1, configuracao: 'Simples ramificação',
      observacoes: 'Demanda compatível com transformador de 150 kVA.',
    },
    createdAt: dayBefore, submittedAt: yesterday, analyzedAt: today,
    history: [
      { id: 'h11', date: dayBefore, action: 'Projeto criado', user: 'Carlos Mendes' },
      { id: 'h12', date: dayBefore, action: 'Cálculo realizado', user: 'Sistema', detail: 'Demanda: 132.8 kW — DIS-NOR-053' },
      { id: 'h13', date: yesterday, action: 'Enviado para análise', user: 'Carlos Mendes' },
      { id: 'h14', date: today, action: 'Projeto em análise', user: 'Ana Beatriz Silva' },
    ],
  },
  {
    id: 'p4',
    code: 'PRJ-2026-004',
    projetistaId: 'u1',
    projetistaName: 'Carlos Mendes',
    normaVersion: 'V1.0',
    status: 'rascunho',
    data: {
      name: 'Edifício Atlântico Sul',
      address: 'Rua dos Coqueiros', number: '150', complement: '',
      neighborhood: 'Pina', city: 'Recife', cep: '51010-000',
      document: '23.456.789/0001-45', artNumber: 'ART-2026-01012',
      technicalResponsible: 'Eng. Carlos Mendes — CREA 12345', observations: 'Edifício residencial de médio porte.',
    },
    units: [
      {
        id: 'u5', name: 'Apartamentos Padrão', unitType: 'Residencial', unitCount: 8,
        tugCount: 6, tueCount: 2, lightingPoints: 5,
        loads: [
          { id: 'l17', type: 'iluminacao', label: 'Iluminação', quantity: 5, powerPerUnit: 100 },
          { id: 'l18', type: 'tug', label: 'TUG', quantity: 6, powerPerUnit: 100 },
          { id: 'l19', type: 'tue', label: 'TUE — Chuveiro', quantity: 1, powerPerUnit: 5500 },
          { id: 'l20', type: 'tue', label: 'TUE — Ar Condicionado', quantity: 1, powerPerUnit: 2000 },
        ],
      },
    ],
    serviceLoads: [
      { id: 'sl10', category: 'elevadores', name: 'Elevador Social', quantity: 1, power: 5000, motorType: 'Trifásico', current: 15, startType: 'Direta' },
      { id: 'sl11', category: 'bombas', name: 'Bomba Hidráulica', quantity: 1, power: 2000, motorType: 'Monofásico', current: 12, startType: 'Direta' },
    ],
    calcResult: {
      totalInstalledPower: 76.8,
      calculatedDemand: 52.3,
      unitCount: 8,
      unitDemand: 46.0,
      serviceDemand: 6.3,
      enquadramento: 'baixa_tensao',
      normaAplicada: 'DIS-NOR-030',
      needsSubstation: false,
    },
    createdAt: today,
    history: [
      { id: 'h15', date: today, action: 'Projeto criado', user: 'Carlos Mendes' },
      { id: 'h16', date: today, action: 'Cálculo realizado', user: 'Sistema', detail: 'Demanda: 52.3 kW — DIS-NOR-030' },
    ],
  },
  {
    id: 'p5',
    code: 'PRJ-2026-005',
    projetistaId: 'u4',
    projetistaName: 'Mariana Costa',
    normaVersion: 'V1.0',
    status: 'enviado_analise',
    data: {
      name: 'Galeria Comercial Centro Histórico',
      address: 'Rua Imperador Pedro II', number: '100', complement: 'Galeria completa',
      neighborhood: 'Centro', city: 'Recife', cep: '50010-000',
      document: '34.567.890/0001-56', artNumber: 'ART-2026-01345',
      technicalResponsible: 'Eng. Mariana Costa — CREA 67890', observations: 'Galeria com 20 lojas pequenas.',
    },
    units: [
      {
        id: 'u6', name: 'Lojas Padrão', unitType: 'Comercial', unitCount: 20,
        tugCount: 6, tueCount: 1, lightingPoints: 5,
        loads: [
          { id: 'l21', type: 'iluminacao', label: 'Iluminação', quantity: 5, powerPerUnit: 100 },
          { id: 'l22', type: 'tug', label: 'TUG', quantity: 6, powerPerUnit: 100 },
          { id: 'l23', type: 'tue', label: 'TUE — Ar Condicionado', quantity: 1, powerPerUnit: 1800 },
        ],
      },
    ],
    serviceLoads: [
      { id: 'sl12', category: 'iluminacao_comum', name: 'Iluminação Corredores', quantity: 1, power: 2000 },
      { id: 'sl13', category: 'seguranca', name: 'Sistema de Segurança', quantity: 1, power: 800 },
    ],
    calcResult: {
      totalInstalledPower: 70.0,
      calculatedDemand: 45.5,
      unitCount: 20,
      unitDemand: 42.0,
      serviceDemand: 3.5,
      enquadramento: 'baixa_tensao',
      normaAplicada: 'DIS-NOR-030',
      needsSubstation: false,
    },
    createdAt: dayBefore, submittedAt: today,
    history: [
      { id: 'h17', date: dayBefore, action: 'Projeto criado', user: 'Mariana Costa' },
      { id: 'h18', date: dayBefore, action: 'Cálculo realizado', user: 'Sistema', detail: 'Demanda: 45.5 kW — DIS-NOR-030' },
      { id: 'h19', date: today, action: 'Enviado para análise', user: 'Mariana Costa' },
    ],
  },
];
