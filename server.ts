import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { serverFirestore } from './src/serverFirestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.APP_JWT_SECRET || 'neofluxo-super-secret-jwt-key-2026';
const PORT = 3000;
const DB_FILE = path.join(__dirname, '.data', 'database.json');

// Ensure db directory
fs.mkdirSync(path.join(__dirname, '.data'), { recursive: true });

// --- INITIAL SEED DATA ---
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('demo123', 10);
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('Admin@123', 10);

const INITIAL_USERS = [
  {
    id: 'u-carlos-mendes',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@neoenergia.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'projetista',
    department: 'Projetos Elétricos',
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'u-ana-silva',
    name: 'Ana Beatriz Silva',
    email: 'ana.silva@neoenergia.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'analista',
    department: 'Análise Técnica',
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'u-roberto-fonseca',
    name: 'Roberto Fonseca',
    email: 'roberto.fonseca@neoenergia.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'admin',
    department: 'Engenharia',
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'u-admin-default',
    name: 'Administrador do Sistema',
    email: 'admin@example.com',
    passwordHash: ADMIN_PASSWORD_HASH,
    role: 'admin',
    department: 'TI / Governança',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u-mariana-costa',
    name: 'Mariana Costa',
    email: 'mariana.costa@neoenergia.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'projetista',
    department: 'Projetos Elétricos',
    active: true,
    createdAt: '2026-01-12T09:30:00Z',
  },
];

const INITIAL_TRANSFORMERS = [
  { id: 't1', label: 'Transformador Padronizado 75 kVA', powerKva: 75, voltage: '13.8kV / 380-220V', active: true },
  { id: 't2', label: 'Transformador Padronizado 112.5 kVA', powerKva: 112.5, voltage: '13.8kV / 380-220V', active: true },
  { id: 't3', label: 'Transformador Padronizado 150 kVA', powerKva: 150, voltage: '13.8kV / 380-220V', active: true },
  { id: 't4', label: 'Transformador Padronizado 225 kVA', powerKva: 225, voltage: '13.8kV / 380-220V', active: true },
  { id: 't5', label: 'Transformador Padronizado 300 kVA', powerKva: 300, voltage: '13.8kV / 380-220V', active: true },
  { id: 't6', label: 'Transformador Padronizado 500 kVA', powerKva: 500, voltage: '13.8kV / 380-220V', active: true },
  { id: 't7', label: 'Transformador Padronizado 750 kVA', powerKva: 750, voltage: '13.8kV / 380-220V', active: true },
  { id: 't8', label: 'Transformador Padronizado 1000 kVA', powerKva: 1000, voltage: '13.8kV / 380-220V', active: true },
];

const INITIAL_DEMAND_FACTORS = [
  { id: 'df1', category: 'iluminacao', label: 'Iluminação — até 1000W', minPower: 0, maxPower: 1000, factor: 1.0, active: true },
  { id: 'df2', category: 'iluminacao', label: 'Iluminação — 1001W a 2000W', minPower: 1001, maxPower: 2000, factor: 0.8, active: true },
  { id: 'df3', category: 'iluminacao', label: 'Iluminação — 2001W a 3000W', minPower: 2001, maxPower: 3000, factor: 0.65, active: true },
  { id: 'df4', category: 'iluminacao', label: 'Iluminação — acima de 3000W', minPower: 3001, maxPower: 0, factor: 0.55, active: true },
  { id: 'df5', category: 'tug', label: 'TUG — até 1000W', minPower: 0, maxPower: 1000, factor: 1.0, active: true },
  { id: 'df6', category: 'tug', label: 'TUG — 1001W a 2000W', minPower: 1001, maxPower: 2000, factor: 0.8, active: true },
  { id: 'df7', category: 'tug', label: 'TUG — 2001W a 3000W', minPower: 2001, maxPower: 3000, factor: 0.6, active: true },
  { id: 'df8', category: 'tug', label: 'TUG — acima de 3000W', minPower: 3001, maxPower: 0, factor: 0.4, active: true },
  { id: 'df9', category: 'tue', label: 'TUE — fator unitário', minPower: 0, maxPower: 0, factor: 1.0, active: true },
  { id: 'df10', category: 'elevador', label: 'Elevadores — 1 a 2 unidades', minPower: 0, maxPower: 0, factor: 1.0, active: true },
  { id: 'df11', category: 'elevadores', label: 'Elevadores — múltiplos', minPower: 0, maxPower: 0, factor: 0.75, active: true },
  { id: 'df12', category: 'bombas', label: 'Bombas d\'água — agrupamento', minPower: 0, maxPower: 0, factor: 0.85, active: true },
  { id: 'df13', category: 'motores', label: 'Motores em geral — fator de demanda', minPower: 0, maxPower: 0, factor: 0.75, active: true },
  { id: 'df14', category: 'seguranca', label: 'Sistemas de segurança e CFTV', minPower: 0, maxPower: 0, factor: 1.0, active: true },
  { id: 'df15', category: 'iluminacao_comum', label: 'Iluminação de áreas comuns', minPower: 0, maxPower: 0, factor: 0.9, active: true },
  { id: 'df16', category: 'portoes', label: 'Portões e cancelas automáticas', minPower: 0, maxPower: 0, factor: 0.5, active: true },
  { id: 'df17', category: 'outros', label: 'Cargas diversas', minPower: 0, maxPower: 0, factor: 0.8, active: true },
];

const INITIAL_PROJECTS = [
  {
    id: 'prj-seed-001',
    code: 'PRJ-2026-001',
    status: 'aprovado',
    currentStep: 6,
    projetistaId: 'u-carlos-mendes',
    projetistaName: 'Carlos Mendes',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-05T14:30:00Z',
    submittedAt: '2026-02-02T11:00:00Z',
    analyzedAt: '2026-02-05T14:30:00Z',
    approvedAt: '2026-02-05T14:30:00Z',
    certificateCode: 'AT-2026-001',
    normaVersion: 'V1.0',
    data: {
      name: 'Residencial Boa Viagem Torre Sul',
      address: 'Av. Boa Viagem',
      number: '1240',
      complement: 'Torre A',
      neighborhood: 'Boa Viagem',
      city: 'Recife',
      cep: '51020-000',
      document: '04.123.456/0001-89',
      artNumber: 'ART-2026-10293',
      technicalResponsible: 'Eng. Carlos Mendes — CREA 19842-PE',
      observations: 'Edifício residencial com 12 apartamentos tipo e área de lazer.',
    },
    units: [
      {
        id: 'u-group-1',
        name: 'Apartamentos Tipo 101 a 602 (12 un.)',
        unitType: 'Residencial',
        unitCount: 12,
        tugCount: 20,
        tueCount: 4,
        lightingPoints: 15,
        loads: [
          { id: 'l1', type: 'iluminacao', label: 'Iluminação LED Residencial', quantity: 15, powerPerUnit: 15 },
          { id: 'l2', type: 'tug', label: 'Tomadas de Uso Geral (TUG)', quantity: 20, powerPerUnit: 100 },
          { id: 'l3', type: 'tue', label: 'Chuveiro Elétrico (TUE)', quantity: 2, powerPerUnit: 4500 },
          { id: 'l4', type: 'tue', label: 'Ar Condicionado Inverter', quantity: 2, powerPerUnit: 1200 },
        ],
      },
    ],
    serviceLoads: [
      { id: 'sl1', category: 'elevadores', name: 'Elevador de Passageiros', quantity: 1, power: 7500, motorType: 'Trifásico', startType: 'Inversor' },
      { id: 'sl2', category: 'bombas', name: 'Bomba de Recalque de Água', quantity: 2, power: 2200, motorType: 'Trifásico', startType: 'Direta' },
      { id: 'sl3', category: 'iluminacao_comum', name: 'Iluminação Garagem e Hall', quantity: 30, power: 20 },
    ],
    calcResult: {
      totalInstalledPower: 178.5,
      calculatedDemand: 58.4,
      unitCount: 12,
      unitDemand: 48.6,
      serviceDemand: 9.8,
      enquadramento: 'baixa_tensao',
      normaAplicada: 'DIS-NOR-030',
      needsSubstation: false,
    },
    atestado: {
      id: 'at-uuid-001',
      code: 'AT-2026-001',
      projectId: 'prj-seed-001',
      projectCode: 'PRJ-2026-001',
      issueDate: '2026-02-05',
      uniqueIdentifier: 'NEO-AT-2026-001-A9F4E',
      analystId: 'u-ana-silva',
      analystName: 'Ana Beatriz Silva',
      validationUrl: '/validar?codigo=NEO-AT-2026-001-A9F4E',
    },
    history: [
      { id: 'h1', date: '2026-02-01', action: 'Projeto criado', user: 'Carlos Mendes' },
      { id: 'h2', date: '2026-02-02', action: 'Projeto enviado para análise', user: 'Carlos Mendes' },
      { id: 'h3', date: '2026-02-03', action: 'Projeto em análise técnica', user: 'Ana Beatriz Silva' },
      { id: 'h4', date: '2026-02-05', action: 'Projeto aprovado', user: 'Ana Beatriz Silva', detail: 'Atestado emitido: AT-2026-001' },
    ],
  },
  {
    id: 'prj-seed-002',
    code: 'PRJ-2026-002',
    status: 'enviado_analise',
    currentStep: 6,
    projetistaId: 'u-carlos-mendes',
    projetistaName: 'Carlos Mendes',
    createdAt: '2026-02-10T11:15:00Z',
    updatedAt: '2026-02-10T14:20:00Z',
    submittedAt: '2026-02-10T14:20:00Z',
    normaVersion: 'V1.0',
    data: {
      name: 'Centro Comercial Riomar Empresarial',
      address: 'Av. República do Líbano',
      number: '251',
      complement: 'Bloco B',
      neighborhood: 'Pina',
      city: 'Recife',
      cep: '51110-160',
      document: '18.998.776/0001-20',
      artNumber: 'ART-2026-20455',
      technicalResponsible: 'Eng. Carlos Mendes — CREA 19842-PE',
      observations: 'Empreendimento comercial com 18 salas e elevador panorâmico.',
    },
    units: [
      {
        id: 'u-group-comm-1',
        name: 'Salas Comerciais Médias (18 un.)',
        unitType: 'Comercial',
        unitCount: 18,
        tugCount: 15,
        tueCount: 3,
        lightingPoints: 12,
        loads: [
          { id: 'lc1', type: 'iluminacao', label: 'Iluminação Comercial', quantity: 12, powerPerUnit: 25 },
          { id: 'lc2', type: 'tug', label: 'Tomadas Computadores / Impressoras', quantity: 15, powerPerUnit: 150 },
          { id: 'lc3', type: 'tue', label: 'Ar Condicionado Central Sala', quantity: 2, powerPerUnit: 2500 },
        ],
      },
    ],
    serviceLoads: [
      { id: 'slc1', category: 'elevadores', name: 'Elevador Panorâmico', quantity: 2, power: 11000, motorType: 'Trifásico', startType: 'Inversor' },
      { id: 'slc2', category: 'bombas', name: 'Bomba de Incêndio / Pressurização', quantity: 2, power: 7500, motorType: 'Trifásico', startType: 'Estrela-Triângulo' },
      { id: 'slc3', category: 'seguranca', name: 'Central de Segurança e Ar Condicionado Hall', quantity: 1, power: 5000 },
    ],
    subestacao: {
      transformadorId: 't3',
      transformadorLabel: 'Transformador Padronizado 150 kVA',
      potenciaNominal: 150,
      quantidade: 1,
      configuracao: 'Simples ramificação',
      observacoes: 'Subestação abrigada em alvenaria conforme DIS-NOR-053.',
    },
    calcResult: {
      totalInstalledPower: 215.4,
      calculatedDemand: 98.7,
      unitCount: 18,
      unitDemand: 72.3,
      serviceDemand: 26.4,
      enquadramento: 'media_tensao',
      normaAplicada: 'DIS-NOR-053',
      needsSubstation: true,
    },
    history: [
      { id: 'h21', date: '2026-02-10', action: 'Projeto criado', user: 'Carlos Mendes' },
      { id: 'h22', date: '2026-02-10', action: 'Cálculo realizado', user: 'Sistema', detail: 'Demanda: 98,7 kW — Média Tensão (DIS-NOR-053)' },
      { id: 'h23', date: '2026-02-10', action: 'Enviado para análise', user: 'Carlos Mendes' },
    ],
  },
  {
    id: 'prj-seed-003',
    code: 'PRJ-2026-003',
    status: 'rascunho',
    currentStep: 3,
    projetistaId: 'u-carlos-mendes',
    projetistaName: 'Carlos Mendes',
    createdAt: '2026-02-14T09:00:00Z',
    updatedAt: '2026-02-14T10:15:00Z',
    normaVersion: 'V1.0',
    data: {
      name: 'Residencial Olinda Verde — Etapa 2',
      address: 'Rua do Sol',
      number: '450',
      complement: 'Bloco C',
      neighborhood: 'Carmo',
      city: 'Olinda',
      cep: '53120-010',
      document: '05.678.910/0001-44',
      artNumber: 'ART-2026-33910',
      technicalResponsible: 'Eng. Carlos Mendes — CREA 19842-PE',
      observations: 'Rascunho salvo na etapa 3 para conferência das bombas.',
    },
    units: [
      {
        id: 'u-olinda-1',
        name: 'Apartamentos 2 Quartos (8 un.)',
        unitType: 'Residencial',
        unitCount: 8,
        tugCount: 16,
        tueCount: 3,
        lightingPoints: 12,
        loads: [
          { id: 'lo1', type: 'iluminacao', label: 'Iluminação', quantity: 12, powerPerUnit: 15 },
          { id: 'lo2', type: 'tug', label: 'TUG', quantity: 16, powerPerUnit: 100 },
          { id: 'lo3', type: 'tue', label: 'Chuveiro', quantity: 1, powerPerUnit: 5500 },
        ],
      },
    ],
    serviceLoads: [
      { id: 'slo1', category: 'bombas', name: 'Bomba de Cisterna', quantity: 1, power: 1500 },
    ],
    calcResult: {
      totalInstalledPower: 58.4,
      calculatedDemand: 34.2,
      unitCount: 8,
      unitDemand: 32.8,
      serviceDemand: 1.4,
      enquadramento: 'baixa_tensao',
      normaAplicada: 'DIS-NOR-030',
      needsSubstation: false,
    },
    history: [
      { id: 'h31', date: '2026-02-14', action: 'Rascunho criado', user: 'Carlos Mendes' },
    ],
  },
  {
    id: 'prj-seed-004',
    code: 'PRJ-2026-004',
    status: 'reprovado',
    currentStep: 4,
    projetistaId: 'u-carlos-mendes',
    projetistaName: 'Carlos Mendes',
    createdAt: '2026-02-08T08:30:00Z',
    updatedAt: '2026-02-12T16:00:00Z',
    submittedAt: '2026-02-09T10:00:00Z',
    analyzedAt: '2026-02-12T16:00:00Z',
    normaVersion: 'V1.0',
    data: {
      name: 'Galpão Logístico Suape Port',
      address: 'Rodovia PE-060',
      number: 'KM 12',
      neighborhood: 'Distrito Industrial',
      city: 'Ipojuca',
      cep: '55590-000',
      document: '33.222.111/0001-44',
      artNumber: 'ART-2026-77889',
      technicalResponsible: 'Eng. Carlos Mendes — CREA 19842-PE',
      observations: 'Galpão de armazenagem climatizada com 4 docas de carga.',
    },
    units: [
      {
        id: 'u-suape-1',
        name: 'Galpão Principal (Docas)',
        unitType: 'Comercial',
        unitCount: 1,
        tugCount: 25,
        tueCount: 6,
        lightingPoints: 40,
        loads: [
          { id: 'ls1', type: 'iluminacao', label: 'Iluminação Industrial High Bay', quantity: 40, powerPerUnit: 150 },
          { id: 'ls2', type: 'tug', label: 'Tomadas Industriais', quantity: 25, powerPerUnit: 250 },
          { id: 'ls3', type: 'tue', label: 'Compressores Pneumáticos', quantity: 4, powerPerUnit: 7500 },
        ],
      },
    ],
    serviceLoads: [
      { id: 'sls1', category: 'bombas', name: 'Bomba de Incêndio Sprinklers', quantity: 2, power: 15000 },
    ],
    calcResult: {
      totalInstalledPower: 112.5,
      calculatedDemand: 68.2,
      unitCount: 1,
      unitDemand: 42.7,
      serviceDemand: 25.5,
      enquadramento: 'baixa_tensao',
      normaAplicada: 'DIS-NOR-030',
      needsSubstation: false,
    },
    rejection: {
      reason: 'Subdimensionamento de cargas de climatização / TUE',
      observations: 'O memorial descritivo não computou os motores de refrigeração das câmaras frigoríficas das docas 3 e 4. Recomenda-se ajustar a planilha de cargas e reenviar para homologação.',
      analyst: 'Ana Beatriz Silva',
      analystId: 'u-ana-silva',
      date: '2026-02-12T16:00:00Z',
    },
    history: [
      { id: 'h41', date: '2026-02-08', action: 'Projeto criado', user: 'Carlos Mendes' },
      { id: 'h42', date: '2026-02-09', action: 'Enviado para análise', user: 'Carlos Mendes' },
      { id: 'h43', date: '2026-02-10', action: 'Em análise técnica', user: 'Ana Beatriz Silva' },
      { id: 'h44', date: '2026-02-12', action: 'Projeto reprovado', user: 'Ana Beatriz Silva', detail: 'Subdimensionamento de cargas de climatização / TUE' },
    ],
  },
  {
    id: 'prj-seed-005',
    code: 'PRJ-2026-005',
    status: 'em_analise',
    currentStep: 6,
    projetistaId: 'u-mariana-costa',
    projetistaName: 'Mariana Costa',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-16T11:00:00Z',
    submittedAt: '2026-02-15T15:00:00Z',
    normaVersion: 'V1.0',
    data: {
      name: 'Complexo Hospitalar Esperança Recife',
      address: 'Rua Antônio Cândido',
      number: '180',
      neighborhood: 'Derby',
      city: 'Recife',
      cep: '52010-000',
      document: '44.555.666/0001-88',
      artNumber: 'ART-2026-99120',
      technicalResponsible: 'Eng. Mariana Costa — CREA 22410-PE',
      observations: 'Nova ala de diagnósticos por imagem e leitos de UTI.',
    },
    units: [
      {
        id: 'u-hosp-1',
        name: 'Ala Diagnósticos e Imagem (1 un.)',
        unitType: 'Comercial',
        unitCount: 1,
        tugCount: 50,
        tueCount: 12,
        lightingPoints: 80,
        loads: [
          { id: 'lh1', type: 'iluminacao', label: 'Iluminação Hospitalar LED', quantity: 80, powerPerUnit: 36 },
          { id: 'lh2', type: 'tug', label: 'Tomadas de Precisão UTI', quantity: 50, powerPerUnit: 200 },
          { id: 'lh3', type: 'tue', label: 'Ressonância Magnética e Tomógrafo', quantity: 2, powerPerUnit: 45000 },
        ],
      },
    ],
    serviceLoads: [
      { id: 'slh1', category: 'elevadores', name: 'Elevador de Macas', quantity: 2, power: 15000 },
      { id: 'slh2', category: 'bombas', name: 'Bombas de Vácuo e Gases Medicinais', quantity: 3, power: 5500 },
    ],
    subestacao: {
      transformadorId: 't5',
      transformadorLabel: 'Transformador Padronizado 300 kVA',
      potenciaNominal: 300,
      quantidade: 1,
      configuracao: 'Subestação abrigada com cubículos blindados 13.8kV/380-220V',
      observacoes: 'Dimensionamento crítico hospitalar com grupo gerador de emergência associado.',
    },
    calcResult: {
      totalInstalledPower: 285.4,
      calculatedDemand: 184.2,
      unitCount: 1,
      unitDemand: 137.7,
      serviceDemand: 46.5,
      enquadramento: 'media_tensao',
      normaAplicada: 'DIS-NOR-053',
      needsSubstation: true,
    },
    history: [
      { id: 'h51', date: '2026-02-15', action: 'Projeto criado', user: 'Mariana Costa' },
      { id: 'h52', date: '2026-02-15', action: 'Enviado para análise técnica', user: 'Mariana Costa' },
      { id: 'h53', date: '2026-02-16', action: 'Análise técnica iniciada', user: 'Ana Beatriz Silva' },
    ],
  },
];

// --- DATABASE HANDLER ---
interface Database {
  users: any[];
  projects: any[];
  transformers: any[];
  demandFactors: any[];
  logs: any[];
}

function loadDatabase(): Database {
  let db: Database = {
    users: [...INITIAL_USERS],
    projects: [...INITIAL_PROJECTS],
    transformers: [...INITIAL_TRANSFORMERS],
    demandFactors: [...INITIAL_DEMAND_FACTORS],
    logs: [
      { id: 'log-1', timestamp: new Date().toISOString(), user: 'Sistema', action: 'Inicialização do banco de dados Neofluxo', level: 'INFO' }
    ],
  };

  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.users) && Array.isArray(parsed.projects)) {
        // Preserve existing user data and merge any missing seed users
        const userEmails = new Set(parsed.users.map((u: any) => u.email.toLowerCase()));
        for (const u of INITIAL_USERS) {
          if (!userEmails.has(u.email.toLowerCase())) {
            parsed.users.push(u);
          }
        }

        // Preserve existing project data and merge any missing seed projects
        const projectCodes = new Set(parsed.projects.map((p: any) => p.code));
        for (const p of INITIAL_PROJECTS) {
          if (!projectCodes.has(p.code)) {
            parsed.projects.push(p);
          }
        }

        if (!Array.isArray(parsed.transformers) || parsed.transformers.length === 0) {
          parsed.transformers = INITIAL_TRANSFORMERS;
        }

        if (!Array.isArray(parsed.demandFactors) || parsed.demandFactors.length === 0) {
          parsed.demandFactors = INITIAL_DEMAND_FACTORS;
        }

        db = parsed;
        saveDatabase(db);
        return db;
      }
    }
  } catch (err) {
    console.error('Error loading database, resetting to initial seed:', err);
  }

  saveDatabase(db);
  return db;
}

function saveDatabase(db: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let db = loadDatabase();

// Sync initial and existing data with Cloud Firestore (Persistência real no banco)
async function syncFirestoreOnStartup() {
  try {
    console.log('[Firestore] Initiating startup sync with Cloud Firestore...');

    // 1. Sync Users
    const cloudUsers = await serverFirestore.query('users');
    console.log(`[Firestore] Found ${cloudUsers.length} users in Cloud Firestore`);
    if (cloudUsers.length > 0) {
      for (const cu of cloudUsers) {
        const localIdx = db.users.findIndex(
          (u) => u.id === cu.id || (cu.email && u.email?.toLowerCase() === cu.email?.toLowerCase()),
        );
        if (localIdx >= 0) {
          db.users[localIdx] = { ...db.users[localIdx], ...cu };
        } else {
          db.users.push(cu);
        }
      }
    }
    // Seed initial users to Firestore
    for (const u of db.users) {
      serverFirestore.set('users', u.id, u).catch(() => {});
    }

    // 2. Sync Projects
    const cloudProjects = await serverFirestore.query('projects');
    console.log(`[Firestore] Found ${cloudProjects.length} projects in Cloud Firestore`);
    if (cloudProjects.length > 0) {
      for (const cp of cloudProjects) {
        const localIdx = db.projects.findIndex((p) => p.id === cp.id || p.code === cp.code);
        if (localIdx >= 0) {
          db.projects[localIdx] = { ...db.projects[localIdx], ...cp };
        } else {
          db.projects.push(cp);
        }
      }
    }
    // Seed initial projects to Firestore
    for (const p of db.projects) {
      serverFirestore.set('projects', p.id, p).catch(() => {});
      if (p.atestado && p.atestado.code) {
        serverFirestore.set('certificates', p.atestado.code, p.atestado).catch(() => {});
      }
    }

    // 3. Seed transformers and demand factors
    for (const t of db.transformers) {
      serverFirestore.set('transformers', t.id, t).catch(() => {});
    }
    for (const df of db.demandFactors) {
      serverFirestore.set('demandFactors', df.id, df).catch(() => {});
    }

    saveDatabase(db);
    console.log('[Firestore] Startup sync with Cloud Firestore completed.');
  } catch (err) {
    console.error('[Firestore] Error during startup sync:', err);
  }
}

// Run async sync on boot
syncFirestoreOnStartup();

// --- CALCULATION ENGINE IMPLEMENTATION ---
function findFactor(category: string, powerW: number, factors: typeof INITIAL_DEMAND_FACTORS): { factor: number; rule: string } {
  const matching = factors.filter(
    (f) =>
      f.category === category &&
      f.active &&
      powerW >= f.minPower &&
      (f.maxPower === 0 || powerW <= f.maxPower),
  );
  if (matching.length > 0) {
    return { factor: matching[0].factor, rule: matching[0].label };
  }
  return { factor: 1.0, rule: 'Fator padrão unitário (1.0)' };
}

export function performDemandCalculation(units: any[], serviceLoads: any[]) {
  const factors = db.demandFactors;
  const memoryItems: any[] = [];
  let totalInstalledW = 0;
  let totalUnitDemandW = 0;
  let unitCountTotal = 0;

  // Process Consumer Units
  for (const group of units || []) {
    const groupUnits = Math.max(1, group.unitCount || 1);
    unitCountTotal += groupUnits;
    let groupUnitInstalledW = 0;
    let groupUnitDemandW = 0;

    for (const load of group.loads || []) {
      const loadPowerW = (load.quantity || 1) * (load.powerPerUnit || 0);
      groupUnitInstalledW += loadPowerW;
      const { factor, rule } = findFactor(load.type, loadPowerW, factors);
      const loadDemandW = loadPowerW * factor;
      groupUnitDemandW += loadDemandW;

      const label = load.label || load.name || load.type || 'Carga';
      memoryItems.push({
        group: group.name || 'Grupo sem nome',
        category: load.type,
        description: `${label} (${load.quantity || 1}x ${load.powerPerUnit || 0}W por unidade)`,
        unitsAffected: groupUnits,
        individualPowerW: loadPowerW,
        totalPowerKw: Number(((loadPowerW * groupUnits) / 1000).toFixed(3)),
        demandFactor: factor,
        ruleReference: `DIS-NOR-030: ${rule}`,
        resultDemandKw: Number(((loadDemandW * groupUnits) / 1000).toFixed(3)),
      });
    }

    totalInstalledW += groupUnitInstalledW * groupUnits;
    totalUnitDemandW += groupUnitDemandW * groupUnits;
  }

  // Process Common Service Loads
  let serviceInstalledW = 0;
  let serviceDemandW = 0;

  for (const s of serviceLoads || []) {
    const sPowerW = (s.quantity || 1) * (s.power || 0);
    serviceInstalledW += sPowerW;
    const { factor, rule } = findFactor(s.category, sPowerW, factors);
    const sDemandW = sPowerW * factor;
    serviceDemandW += sDemandW;

    memoryItems.push({
      group: 'Cargas de Serviço / Condomínio',
      category: s.category,
      description: `${s.name} (${s.quantity}x ${s.power}W)`,
      unitsAffected: 1,
      individualPowerW: sPowerW,
      totalPowerKw: Number((sPowerW / 1000).toFixed(3)),
      demandFactor: factor,
      ruleReference: `DIS-NOR-030 (Serviço): ${rule}`,
      resultDemandKw: Number((sDemandW / 1000).toFixed(3)),
    });
  }

  const powerFactor = 0.92;
  const grandTotalInstalledKw = Number(((totalInstalledW + serviceInstalledW) / 1000).toFixed(2));
  const calculatedDemandKw = Number(((totalUnitDemandW + serviceDemandW) / 1000).toFixed(2));
  const unitDemandKw = Number((totalUnitDemandW / 1000).toFixed(2));
  const serviceDemandKw = Number((serviceDemandW / 1000).toFixed(2));

  const demandKva = Number((calculatedDemandKw / powerFactor).toFixed(2));
  const totalInstalledKva = Number((grandTotalInstalledKw / powerFactor).toFixed(2));
  const unitDemandKva = Number((unitDemandKw / powerFactor).toFixed(2));
  const serviceDemandKva = Number((serviceDemandKw / powerFactor).toFixed(2));
  const simultaneityFactor = grandTotalInstalledKw > 0 ? Number((calculatedDemandKw / grandTotalInstalledKw).toFixed(3)) : 1.0;

  const isLowVoltage = calculatedDemandKw <= 75.0;
  const enquadramento = isLowVoltage ? 'baixa_tensao' : 'media_tensao';
  const normaAplicada = isLowVoltage ? 'DIS-NOR-030' : 'DIS-NOR-053';
  const needsSubstation = !isLowVoltage;

  const standardTransformers = [75, 112.5, 150, 225, 300, 500, 750, 1000];
  const recommendedTransformerKva = needsSubstation
    ? (standardTransformers.find((r) => r >= demandKva) || 1000)
    : null;

  return {
    totalInstalledPower: grandTotalInstalledKw,
    totalInstalledKva,
    calculatedDemand: calculatedDemandKw,
    demandKva,
    powerFactor,
    simultaneityFactor,
    unitCount: unitCountTotal,
    unitDemand: unitDemandKw,
    unitDemandKva,
    serviceDemand: serviceDemandKw,
    serviceDemandKva,
    recommendedTransformerKva,
    enquadramento,
    normaAplicada,
    needsSubstation,
    calculationMemory: memoryItems,
    calculatedAt: new Date().toISOString(),
    demandLimitKw: 75.0,
  };
}

// --- EXPRESS APP SETUP ---
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- AUTH MIDDLEWARE ---
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      try {
        const decodedFb: any = jwt.decode(token);
        if (
          decodedFb &&
          (decodedFb.firebase ||
            decodedFb.iss?.includes('securetoken.google.com') ||
            decodedFb.aud?.includes('gen-lang-client') ||
            decodedFb.email)
        ) {
          const email = decodedFb.email || '';
          let user = db.users.find(
            (u) =>
              (email && u.email.toLowerCase() === email.toLowerCase()) ||
              u.id === decodedFb.sub ||
              u.id === decodedFb.user_id,
          );
          if (!user && email) {
            user = {
              id: decodedFb.sub || decodedFb.user_id || `u-${Date.now()}`,
              name: decodedFb.name || email.split('@')[0] || 'Usuário Google',
              email: email.toLowerCase(),
              passwordHash: '',
              role:
                email === 'admin@example.com' || email.includes('admin')
                  ? 'admin'
                  : email.includes('analista')
                  ? 'analista'
                  : 'projetista',
              department: 'Projetos Elétricos',
              active: true,
              createdAt: new Date().toISOString(),
            };
            db.users.push(user);
            saveDatabase(db);
          }
          if (user && user.active) {
            (req as any).user = user;
            return next();
          }
        }
      } catch (fbErr) {
        console.warn('Falha ao decodificar token alternativo:', fbErr);
      }
      return res.status(401).json({ error: 'Sessão expirada ou token inválido' });
    }
    const user = db.users.find((u) => u.id === decoded.sub || u.id === decoded.id);
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Usuário desativado ou não encontrado' });
    }
    (req as any).user = user;
    next();
  });
}

function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const currentUser = (req as any).user;
    if (!currentUser || !roles.includes(currentUser.role.toLowerCase())) {
      return res.status(403).json({ error: 'Acesso negado: perfil sem permissão para esta operação' });
    }
    next();
  };
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  return res.json({ status: 'ok', service: 'neofluxo', timestamp: new Date().toISOString() });
});

// ==========================================
// API ROUTES: US-01 AUTH & USERS
// ==========================================

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  if (!user.active) {
    return res.status(403).json({ error: 'Esta conta está inativa. Contate o administrador.' });
  }

  const token = jwt.sign(
    { sub: user.id, id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  });
});

// Register (Cadastro com validação completa de campos)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role = 'projetista', department = 'Projetos Elétricos' } = req.body;

  if (!name || name.trim().length < 3) {
    return res.status(400).json({ error: 'O nome completo deve ter pelo menos 3 caracteres' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Informe um e-mail válido' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'A senha deve conter no mínimo 6 caracteres' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Já existe uma conta cadastrada com este e-mail' });
  }

  // Simplified access: allow selecting either Projetista or Analista directly
  const allowedRole = role === 'analista' ? 'analista' : 'projetista';
  const newUser = {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    role: allowedRole,
    department: department.trim(),
    active: true,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDatabase(db);
  serverFirestore.set('users', newUser.id, newUser).catch((err) =>
    console.error('[Firestore] Error saving registered user:', err),
  );

  const token = jwt.sign(
    { sub: newUser.id, id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
    },
  });
});

// ==========================================
// GOOGLE AUTH: PROFILE SELECTION & ONBOARDING
// ==========================================

// Google Sign-In: Step 1 - Verify or check existing profile
app.post('/api/auth/google/verify', (req: Request, res: Response) => {
  const { email, name, uid, photoUrl } = req.body;
  if (!email || !uid) {
    return res.status(400).json({ error: 'E-mail e UID do Google são obrigatórios' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = db.users.find(
    (u) =>
      u.googleUid === uid ||
      u.id === uid ||
      (u.email && u.email.toLowerCase() === normalizedEmail),
  );

  // If user does not exist or has not yet selected their profile
  if (!user || !user.role || (user as any).needsProfile) {
    return res.json({
      needsProfile: true,
      googleData: {
        uid,
        name: user?.name || name || email.split('@')[0],
        email: normalizedEmail,
        photoUrl: photoUrl || '',
      },
    });
  }

  // Link Google UID if not already linked
  if (!user.googleUid) {
    user.googleUid = uid;
    user.authProvider = 'google';
  }
  // Ensure user is active (no administrative blocking for regular portal use)
  if (!user.active) {
    user.active = true;
    (user as any).status = 'ativo';
    (user as any).pendingApproval = false;
  }
  saveDatabase(db);
  serverFirestore.set('users', user.id, user).catch(() => {});

  // User exists and has an authorized profile -> issue JWT token
  const token = jwt.sign(
    { sub: user.id, id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' },
  );

  return res.json({
    needsProfile: false,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  });
});

// Google Sign-In: Step 2 - Complete profile selection with direct activation
app.post('/api/auth/google/complete-profile', (req: Request, res: Response) => {
  const { uid, email, name, role = 'projetista', department } = req.body;

  if (!email || !uid) {
    return res.status(400).json({ error: 'Credenciais do Google ausentes' });
  }
  if (!name || name.trim().length < 3) {
    return res.status(400).json({ error: 'O nome completo deve ter pelo menos 3 caracteres' });
  }
  if (!department || !department.trim()) {
    return res.status(400).json({ error: 'Informe o departamento ou área de atuação' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const selectedRole = String(role).toLowerCase();

  if (!['projetista', 'analista', 'admin'].includes(selectedRole)) {
    return res.status(400).json({ error: 'Perfil de acesso inválido' });
  }

  let user = db.users.find(
    (u) =>
      u.googleUid === uid ||
      u.id === uid ||
      (u.email && u.email.toLowerCase() === normalizedEmail),
  );

  const isBootstrapAdmin =
    normalizedEmail === 'admin@example.com' ||
    normalizedEmail === 'roberto.fonseca@neoenergia.com';

  // SECURITY ENFORCEMENT & SIMPLIFIED ACCESS:
  // Administrador cannot be self-granted by regular users without admin credentials,
  // but instead of blocking the user, they receive instant authorized access as Projetista or Analista.
  let finalRole: string = 'projetista';
  if (selectedRole === 'admin') {
    finalRole = isBootstrapAdmin ? 'admin' : 'projetista';
  } else if (selectedRole === 'analista') {
    finalRole = 'analista';
  } else {
    finalRole = 'projetista';
  }

  const active = true;
  const status = 'ativo';
  const pendingApproval = false;
  const responseMessage = 'Cadastro concluído e acesso liberado com sucesso!';

  if (user) {
    user.name = name.trim();
    user.department = department.trim();
    user.googleUid = uid;
    user.authProvider = 'google';
    (user as any).requestedRole = selectedRole;
    (user as any).pendingApproval = pendingApproval;
    (user as any).status = status;
    user.active = active;
    user.role = finalRole;
    user.updatedAt = new Date().toISOString();
  } else {
    user = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      email: normalizedEmail,
      googleUid: uid,
      authProvider: 'google',
      passwordHash: '',
      role: finalRole,
      department: department.trim(),
      active,
      status,
      requestedRole: selectedRole,
      pendingApproval,
      createdAt: new Date().toISOString(),
    } as any;
    db.users.push(user);
  }

  saveDatabase(db);
  serverFirestore.set('users', user.id, user).catch((err) =>
    console.error('[Firestore] Error saving Google user profile:', err),
  );

  if (pendingApproval || !active) {
    return res.json({
      success: true,
      pendingApproval: true,
      message: responseMessage,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: (user as any).status,
        requestedRole: (user as any).requestedRole,
      },
    });
  }

  const token = jwt.sign(
    { sub: user.id, id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' },
  );

  return res.json({
    success: true,
    pendingApproval: false,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    message: responseMessage,
  });
});

// Current User Profile
app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
  });
});

// Forgot password mock
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Informe o e-mail corporativo' });
  }
  return res.json({
    message: 'Se o e-mail estiver cadastrado, o link de recuperação foi enviado para sua caixa de entrada.',
  });
});

// ==========================================
// API ROUTES: US-05 CALCULATION ENGINE
// ==========================================
app.post('/api/calc/demand', (req: Request, res: Response) => {
  const { units = [], serviceLoads = [] } = req.body;
  const result = performDemandCalculation(units, serviceLoads);
  return res.json(result);
});

// ==========================================
// API ROUTES: US-04 & US-06 PROJECTS & WIZARD
// ==========================================

// List projects
app.get('/api/projects', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const isReviewer = user.role === 'analista' || user.role === 'admin';

  let list = db.projects;
  if (!isReviewer) {
    list = list.filter((p) => p.projetistaId === user.id);
  }

  // Sort by updatedAt desc
  list = [...list].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

  return res.json(list);
});

// Get project by ID
app.get('/api/projects/:id', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const isReviewer = user.role === 'analista' || user.role === 'admin';
  const project = db.projects.find((p) => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  if (!isReviewer && project.projetistaId !== user.id) {
    return res.status(403).json({ error: 'Você não tem permissão para acessar este projeto' });
  }

  return res.json(project);
});

// Create new project (or draft)
app.post('/api/projects', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const body = req.body;

  const now = new Date().toISOString();
  const dateFormatted = now.split('T')[0];
  const projectCode = body.code || `PRJ-2026-${String(Math.floor(100 + Math.random() * 900))}`;

  const calc = body.units || body.serviceLoads
    ? performDemandCalculation(body.units || [], body.serviceLoads || [])
    : body.calcResult || {
        totalInstalledPower: 0,
        calculatedDemand: 0,
        unitCount: 0,
        unitDemand: 0,
        serviceDemand: 0,
        enquadramento: 'baixa_tensao',
        normaAplicada: 'DIS-NOR-030',
        needsSubstation: false,
      };

  const newProject = {
    id: `prj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    code: projectCode,
    status: body.status || 'rascunho',
    currentStep: body.currentStep || 1,
    projetistaId: user.id,
    projetistaName: user.name,
    createdAt: now,
    updatedAt: now,
    submittedAt: body.status === 'enviado_analise' || body.status === 'em_analise' ? now : null,
    data: body.data || {},
    units: body.units || [],
    serviceLoads: body.serviceLoads || [],
    subestacao: calc.needsSubstation ? body.subestacao : undefined,
    calcResult: calc,
    normaVersion: 'V1.0',
    history: body.history || [
      { id: `h-${Date.now()}`, date: dateFormatted, action: 'Projeto criado (Rascunho)', user: user.name },
    ],
  };

  db.projects.unshift(newProject);
  saveDatabase(db);
  serverFirestore.set('projects', newProject.id, newProject).catch((err) =>
    console.error('[Firestore] Error saving created project:', err),
  );

  return res.status(201).json(newProject);
});

// Update project (general)
app.put('/api/projects/:id', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const projectIndex = db.projects.findIndex((p) => p.id === req.params.id);

  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  const current = db.projects[projectIndex];
  const isReviewer = user.role === 'analista' || user.role === 'admin';

  if (!isReviewer && current.projetistaId !== user.id) {
    return res.status(403).json({ error: 'Permissão negada para alterar este projeto' });
  }

  const updated = {
    ...current,
    ...req.body,
    id: current.id, // prevent ID change
    updatedAt: new Date().toISOString(),
  };

  db.projects[projectIndex] = updated;
  saveDatabase(db);
  serverFirestore.set('projects', updated.id, updated).catch((err) =>
    console.error('[Firestore] Error updating project:', err),
  );

  return res.json(updated);
});

// US-04: Save step incrementally (PUT /api/projects/:id/steps/:step)
app.put('/api/projects/:id/steps/:step', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const stepNumber = parseInt(String(req.params.step), 10);

  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 6) {
    return res.status(400).json({ error: 'Etapa inválida. Deve estar entre 1 e 6' });
  }

  const projectIndex = db.projects.findIndex((p) => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  const current = db.projects[projectIndex];
  if (current.projetistaId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Permissão negada' });
  }

  if (current.status !== 'rascunho' && current.status !== 'reprovado') {
    return res.status(400).json({ error: 'Somente projetos em rascunho ou reprovados podem ser editados' });
  }

  const body = req.body;
  const updated = { ...current };

  if (body.data) updated.data = body.data;
  if (body.units) updated.units = body.units;
  if (body.serviceLoads) updated.serviceLoads = body.serviceLoads;
  if (body.subestacao) updated.subestacao = body.subestacao;

  // Re-calculate if units or service loads changed
  if (body.units || body.serviceLoads) {
    updated.calcResult = performDemandCalculation(
      body.units || updated.units || [],
      body.serviceLoads || updated.serviceLoads || []
    );
  } else if (body.calcResult) {
    updated.calcResult = body.calcResult;
  }

  updated.currentStep = stepNumber;
  updated.updatedAt = new Date().toISOString();

  db.projects[projectIndex] = updated;
  saveDatabase(db);
  serverFirestore.set('projects', updated.id, updated).catch((err) =>
    console.error('[Firestore] Error saving project step:', err),
  );

  return res.json(updated);
});

// Submit project for analysis
app.post('/api/projects/:id/submit', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const projectIndex = db.projects.findIndex((p) => p.id === req.params.id);

  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  const current = db.projects[projectIndex];
  if (current.projetistaId !== user.id) {
    return res.status(403).json({ error: 'Apenas o projetista autor pode submeter o projeto' });
  }

  if (current.status !== 'rascunho' && current.status !== 'reprovado') {
    return res.status(400).json({ error: 'Apenas projetos em rascunho ou reprovados podem ser submetidos' });
  }

  // Validate minimum requirements
  if (!current.data || !current.data.name || !current.data.technicalResponsible) {
    return res.status(400).json({ error: 'Dados obrigatórios do projeto incompletos (Etapa 1)' });
  }

  if (current.calcResult?.needsSubstation && (!current.subestacao || !current.subestacao.transformadorId)) {
    return res.status(400).json({ error: 'Projetos enquadrados em Média Tensão exigem o dimensionamento da subestação conforme DIS-NOR-053' });
  }

  const now = new Date().toISOString();
  const dateFormatted = now.split('T')[0];
  const isResubmission = current.status === 'reprovado';

  const updated = {
    ...current,
    status: 'enviado_analise',
    currentStep: 6,
    submittedAt: now,
    updatedAt: now,
    rejection: null,
    history: [
      ...(current.history || []),
      {
        id: `h-${Date.now()}`,
        date: dateFormatted,
        action: isResubmission ? 'Projeto reenviado para análise técnica' : 'Projeto enviado para análise técnica',
        user: user.name,
        detail: `Demanda: ${current.calcResult?.calculatedDemand || 0} kW (${current.calcResult?.normaAplicada || 'DIS-NOR-030'})`,
      },
    ],
  };

  db.projects[projectIndex] = updated;
  saveDatabase(db);
  serverFirestore.set('projects', updated.id, updated).catch((err) =>
    console.error('[Firestore] Error saving submitted project:', err),
  );

  return res.json(updated);
});

// US-06: Approve project
app.post('/api/projects/:id/approve', authenticateToken, requireRole('analista', 'admin'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const projectIndex = db.projects.findIndex((p) => p.id === req.params.id);

  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  const current = db.projects[projectIndex];
  if (current.status !== 'enviado_analise' && current.status !== 'em_analise') {
    return res.status(400).json({ error: 'Apenas projetos pendentes de análise podem ser aprovados' });
  }

  const now = new Date().toISOString();
  const dateFormatted = now.split('T')[0];
  const codeNum = String(Math.floor(100 + Math.random() * 900));
  const certificateCode = `AT-2026-${codeNum}`;
  const uniqueIdentifier = `NEO-AT-2026-${codeNum}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const validationUrl = `/validar?codigo=${uniqueIdentifier}`;

  const certificate = {
    id: `at-${Date.now()}`,
    code: certificateCode,
    projectId: current.id,
    projectCode: current.code,
    issueDate: dateFormatted,
    uniqueIdentifier,
    title: 'Atestado de Conformidade Técnica e Enquadramento de Demanda',
    beneficiaryName: current.data?.name || 'Não informado',
    beneficiaryDocument: current.data?.document || '—',
    address: `${current.data?.address || ''}, ${current.data?.number || ''} — ${current.data?.neighborhood || ''}, ${current.data?.city || 'Recife - PE'}`,
    technicalResponsible: current.data?.technicalResponsible || current.projetistaName || user.name,
    professionalRegister: current.data?.artNumber || 'CREA/CFT Registrado',
    analystId: user.id,
    analystName: user.name,
    validationUrl,
    qrCodeData: validationUrl,
    normaAplicada: current.calcResult?.normaAplicada || 'DIS-NOR-030',
    enquadramento: current.calcResult?.enquadramento || 'baixa_tensao',
    calculatedDemand: current.calcResult?.calculatedDemand || 0,
    totalInstalledPower: current.calcResult?.totalInstalledPower || 0,
    substationInfo: current.subestacao ? `${current.subestacao.transformadorLabel || ''} (${current.subestacao.potenciaNominal || ''} kVA)` : undefined,
  };

  const updated = {
    ...current,
    status: 'aprovado',
    analyzedAt: now,
    approvedAt: now,
    updatedAt: now,
    certificateCode,
    atestado: certificate,
    rejection: null,
    history: [
      ...(current.history || []),
      {
        id: `h-${Date.now()}`,
        date: dateFormatted,
        action: 'Projeto aprovado pela análise técnica',
        user: user.name,
        detail: `Atestado Técnico emitido: ${certificateCode} (${uniqueIdentifier})`,
      },
    ],
  };

  db.projects[projectIndex] = updated;
  saveDatabase(db);
  serverFirestore.set('projects', updated.id, updated).catch((err) =>
    console.error('[Firestore] Error saving approved project:', err),
  );
  serverFirestore.set('certificates', certificate.code, certificate).catch((err) =>
    console.error('[Firestore] Error saving digital certificate:', err),
  );

  return res.json(updated);
});

// Emit / Generate Atestado directly (No admin approval requirement)
app.post('/api/projects/:id/emit-atestado', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const projectIndex = db.projects.findIndex((p) => p.id === req.params.id);

  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  const current = db.projects[projectIndex];
  const isAuthor = current.projetistaId === user.id;
  const isAuthorized = isAuthor || user.role === 'analista' || user.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({ error: 'Permissão negada para emitir o atestado deste projeto' });
  }

  // If atestado already exists, return current project with existing atestado
  if (current.atestado && current.atestado.code) {
    return res.json(current);
  }

  const now = new Date().toISOString();
  const dateFormatted = now.split('T')[0];
  const codeNum = String(Math.floor(100 + Math.random() * 900));
  const certificateCode = `AT-2026-${codeNum}`;
  const uniqueIdentifier = `NEO-AT-2026-${codeNum}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const validationUrl = `/validar?codigo=${uniqueIdentifier}`;

  const certificate = {
    id: `at-${Date.now()}`,
    code: certificateCode,
    projectId: current.id,
    projectCode: current.code,
    issueDate: dateFormatted,
    uniqueIdentifier,
    title: 'Atestado de Conformidade Técnica e Enquadramento de Demanda',
    beneficiaryName: current.data?.name || 'Não informado',
    beneficiaryDocument: current.data?.document || '—',
    address: `${current.data?.address || ''}, ${current.data?.number || ''} — ${current.data?.neighborhood || ''}, ${current.data?.city || 'Recife - PE'}`,
    technicalResponsible: current.data?.technicalResponsible || current.projetistaName || user.name,
    professionalRegister: current.data?.artNumber || 'Registro CREA/CFT Validado',
    analystId: user.role === 'analista' ? user.id : undefined,
    analystName: user.role === 'analista' ? user.name : 'Homologação por Conformidade Técnica',
    validationUrl,
    qrCodeData: validationUrl,
    normaAplicada: current.calcResult?.normaAplicada || 'DIS-NOR-030',
    enquadramento: current.calcResult?.enquadramento || 'baixa_tensao',
    calculatedDemand: current.calcResult?.calculatedDemand || 0,
    totalInstalledPower: current.calcResult?.totalInstalledPower || 0,
    substationInfo: current.subestacao ? `${current.subestacao.transformadorLabel || ''} (${current.subestacao.potenciaNominal || ''} kVA)` : undefined,
  };

  const updated = {
    ...current,
    status: current.status === 'rascunho' ? 'aprovado' : current.status,
    approvedAt: current.approvedAt || now,
    certificateCode,
    atestado: certificate,
    updatedAt: now,
    history: [
      ...(current.history || []),
      {
        id: `h-${Date.now()}`,
        date: dateFormatted,
        action: 'Atestado Técnico emitido com sucesso',
        user: user.name,
        detail: `Atestado Técnico emitido: ${certificateCode} (${uniqueIdentifier})`,
      },
    ],
  };

  db.projects[projectIndex] = updated;
  saveDatabase(db);
  serverFirestore.set('projects', updated.id, updated).catch((err) =>
    console.error('[Firestore] Error saving project with emitted atestado:', err),
  );
  serverFirestore.set('certificates', certificate.code, certificate).catch((err) =>
    console.error('[Firestore] Error saving digital certificate:', err),
  );

  return res.json(updated);
});

// US-06: Reject project
app.post('/api/projects/:id/reject', authenticateToken, requireRole('analista', 'admin'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const { reason, observations = '' } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'O motivo da reprovação é obrigatório' });
  }

  const projectIndex = db.projects.findIndex((p) => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  const current = db.projects[projectIndex];
  if (current.status !== 'enviado_analise' && current.status !== 'em_analise') {
    return res.status(400).json({ error: 'Apenas projetos pendentes de análise podem ser reprovados' });
  }

  const now = new Date().toISOString();
  const dateFormatted = now.split('T')[0];

  const rejection = {
    reason: reason.trim(),
    observations: observations.trim(),
    analyst: user.name,
    analystId: user.id,
    date: dateFormatted,
  };

  const updated = {
    ...current,
    status: 'reprovado',
    analyzedAt: now,
    approvedAt: null,
    updatedAt: now,
    rejection,
    atestado: null,
    certificateCode: null,
    history: [
      ...(current.history || []),
      {
        id: `h-${Date.now()}`,
        date: dateFormatted,
        action: 'Projeto reprovado pela análise técnica',
        user: user.name,
        detail: `Motivo: ${reason.trim()} ${observations.trim() ? '— ' + observations.trim() : ''}`,
      },
    ],
  };

  db.projects[projectIndex] = updated;
  saveDatabase(db);
  serverFirestore.set('projects', updated.id, updated).catch((err) =>
    console.error('[Firestore] Error saving rejected project:', err),
  );

  return res.json(updated);
});

// Delete project (draft only)
app.delete('/api/projects/:id', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const projectIndex = db.projects.findIndex((p) => p.id === req.params.id);

  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  const current = db.projects[projectIndex];
  if (current.projetistaId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Permissão negada' });
  }

  if (current.status !== 'rascunho') {
    return res.status(400).json({ error: 'Apenas rascunhos podem ser excluídos' });
  }

  db.projects.splice(projectIndex, 1);
  saveDatabase(db);
  serverFirestore.delete('projects', String(req.params.id)).catch((err) =>
    console.error('[Firestore] Error deleting project from cloud:', err),
  );

  return res.status(204).send();
});

// ==========================================
// API ROUTES: US-07 CERTIFICATES VALIDATION
// ==========================================
app.get('/api/certificates/validate/:code', (req: Request, res: Response) => {
  const rawCode = String(req.params.code).trim().toUpperCase();

  const project = db.projects.find((p) => {
    if (!p.atestado) return false;
    const at = p.atestado;
    return (
      (at.code && at.code.toUpperCase() === rawCode) ||
      (at.uniqueIdentifier && at.uniqueIdentifier.toUpperCase() === rawCode) ||
      (p.certificateCode && p.certificateCode.toUpperCase() === rawCode)
    );
  });

  if (!project || !project.atestado) {
    return res.status(404).json({
      valid: false,
      message: 'Atestado não encontrado ou código inválido.',
    });
  }

  return res.json({
    valid: true,
    certificate: project.atestado,
    project: {
      id: project.id,
      code: project.code,
      name: project.data?.name || 'Empreendimento Sem Nome',
      address: `${project.data?.address || ''}, ${project.data?.number || ''}`,
      neighborhood: project.data?.neighborhood || '',
      city: project.data?.city || '',
      technicalResponsible: project.data?.technicalResponsible || '',
      document: project.data?.document || '',
      calculatedDemand: project.calcResult?.calculatedDemand || 0,
      enquadramento: project.calcResult?.enquadramento || 'baixa_tensao',
      normaAplicada: project.calcResult?.normaAplicada || 'DIS-NOR-030',
      approvedAt: project.approvedAt || project.analyzedAt,
    },
  });
});

// ==========================================
// API ROUTES: TRANSFORMERS & FACTORS & USERS & FIREBASE
// ==========================================
app.get('/api/transformers', (_req: Request, res: Response) => {
  return res.json(db.transformers);
});

app.post('/api/transformers', authenticateToken, requireRole('admin'), (req: Request, res: Response) => {
  const newT = { id: `t-${Date.now()}`, ...req.body, active: true };
  db.transformers.push(newT);
  saveDatabase(db);
  return res.status(201).json(newT);
});

app.put('/api/transformers/:id', authenticateToken, requireRole('admin'), (req: Request, res: Response) => {
  const idx = db.transformers.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Transformador não encontrado' });
  db.transformers[idx] = { ...db.transformers[idx], ...req.body };
  saveDatabase(db);
  serverFirestore.set('transformers', db.transformers[idx].id, db.transformers[idx]).catch((err) =>
    console.error('[Firestore] Error saving transformer:', err),
  );
  return res.json(db.transformers[idx]);
});

app.delete('/api/transformers/:id', authenticateToken, requireRole('admin'), (req: Request, res: Response) => {
  const idx = db.transformers.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Transformador não encontrado' });
  db.transformers.splice(idx, 1);
  saveDatabase(db);
  serverFirestore.delete('transformers', String(req.params.id)).catch((err) =>
    console.error('[Firestore] Error deleting transformer:', err),
  );
  return res.status(204).send();
});

app.get('/api/demand-factors', (_req: Request, res: Response) => {
  return res.json(db.demandFactors);
});

app.put('/api/demand-factors/:id', authenticateToken, requireRole('admin'), (req: Request, res: Response) => {
  const idx = db.demandFactors.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Fator não encontrado' });
  db.demandFactors[idx] = { ...db.demandFactors[idx], ...req.body };
  saveDatabase(db);
  serverFirestore.set('demandFactors', db.demandFactors[idx].id, db.demandFactors[idx]).catch((err) =>
    console.error('[Firestore] Error saving demand factor:', err),
  );
  return res.json(db.demandFactors[idx]);
});

app.get('/api/users', authenticateToken, requireRole('admin'), (_req: Request, res: Response) => {
  const safeUsers = db.users.map(({ passwordHash, ...rest }) => rest);
  return res.json(safeUsers);
});

app.get('/api/users/:id', authenticateToken, (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  if (currentUser.role !== 'admin' && currentUser.id !== user.id) {
    return res.status(403).json({ error: 'Acesso não autorizado' });
  }
  const { passwordHash, ...safe } = user;
  return res.json(safe);
});

app.post('/api/users', authenticateToken, requireRole('admin'), (req: Request, res: Response) => {
  const { name, email, password = 'demo123', role = 'projetista', department = 'Geral' } = req.body;
  const newUser = {
    id: `u-${Date.now()}`,
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    department,
    active: true,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveDatabase(db);
  serverFirestore.set('users', newUser.id, newUser).catch((err) =>
    console.error('[Firestore] Error saving user:', err),
  );
  const { passwordHash, ...safe } = newUser;
  return res.status(201).json(safe);
});

app.put('/api/users/:id', authenticateToken, (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  const idx = db.users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Usuário não encontrado' });

  const targetUser = db.users[idx];
  const isAdmin = currentUser.role === 'admin';
  const isSelf = currentUser.id === targetUser.id;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ error: 'Sem permissão para alterar este usuário' });
  }

  const { name, department, active, role, password } = req.body;

  // Anti-Privilege Escalation: non-admins cannot change role or activate accounts
  if (!isAdmin && role && role !== targetUser.role) {
    return res.status(403).json({ error: 'Operação proibida: você não pode alterar seu próprio perfil' });
  }

  targetUser.name = name !== undefined ? name : targetUser.name;
  targetUser.department = department !== undefined ? department : targetUser.department;
  if (isAdmin) {
    if (active !== undefined) targetUser.active = Boolean(active);
    if (role) targetUser.role = role.toLowerCase();
  }
  if (password) {
    targetUser.passwordHash = bcrypt.hashSync(password, 10);
  }

  db.users[idx] = targetUser;
  saveDatabase(db);
  serverFirestore.set('users', targetUser.id, targetUser).catch((err) =>
    console.error('[Firestore] Error saving user updates:', err),
  );

  const { passwordHash, ...safe } = targetUser;
  return res.json(safe);
});

app.delete('/api/users/:id', authenticateToken, requireRole('admin'), (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  if (currentUser.id === req.params.id) {
    return res.status(400).json({ error: 'Você não pode excluir sua própria conta de administrador' });
  }
  const idx = db.users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Usuário não encontrado' });
  db.users.splice(idx, 1);
  saveDatabase(db);
  serverFirestore.delete('users', String(req.params.id)).catch((err) =>
    console.error('[Firestore] Error deleting user:', err),
  );
  return res.status(204).send();
});

// Admin approves a pending user
app.post('/api/users/:id/approve', authenticateToken, requireRole('admin'), (req: Request, res: Response) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const { role } = req.body;
  user.active = true;
  (user as any).status = 'ativo';
  (user as any).pendingApproval = false;
  if (role && ['projetista', 'analista', 'admin'].includes(String(role).toLowerCase())) {
    user.role = String(role).toLowerCase();
  } else if ((user as any).requestedRole) {
    user.role = (user as any).requestedRole;
  }
  user.updatedAt = new Date().toISOString();

  saveDatabase(db);
  serverFirestore.set('users', user.id, user).catch(() => {});

  const { passwordHash, ...safe } = user;
  return res.json({ success: true, user: safe, message: 'Usuário aprovado e ativado com sucesso!' });
});

// Firebase Infrastructure status endpoint
app.get('/api/firebase/status', (_req: Request, res: Response) => {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  let config: any = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch {}
  }
  return res.json({
    connected: true,
    projectId: config.projectId || 'gen-lang-client-0443279078',
    firestoreDatabaseId: config.firestoreDatabaseId || 'ai-studio-neofluxo-07841b20-b8cc-4e94-beca-742d96807593',
    authDomain: config.authDomain || 'gen-lang-client-0443279078.firebaseapp.com',
    timestamp: new Date().toISOString(),
    counts: {
      projects: db.projects.length,
      users: db.users.length,
      transformers: db.transformers.length,
      demandFactors: db.demandFactors.length,
    },
  });
});


// Mount Vite in dev mode or serve static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Neofluxo] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
