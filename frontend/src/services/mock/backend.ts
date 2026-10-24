/**
 * Modo demonstração (VITE_MOCK=1): um "back" em memória que imita o Spring.
 *
 * Só é carregado por import dinâmico em api.ts quando o build tem VITE_MOCK,
 * então não entra no bundle normal. Devolve objetos Response de verdade, pra o
 * fetchApi tratar 401, erro e 204 exatamente como faz com o servidor.
 *
 * Regras copiadas de ProjectService, AuthService, CertificateController e
 * ApiExceptionHandler (src/main/java/...). Os dados ficam no localStorage do
 * navegador, na chave MOCK_STORAGE_KEY.
 */
import seed from './seed.json';
import { calculateProjectDemand, calculateServiceLoads, calculateUnitDemand } from '@/services/calcEngine';
import type { ConsumerUnitGroup, DemandFactor, ServiceLoad } from '@/types';

export const MOCK_STORAGE_KEY = 'neofluxo-demo-v1';
const LATENCIA_MS = 250;

// Hash (cyrb53) da senha de demonstração do DataInitializer — a senha em si não fica aqui.
const HASH_SENHA_DEMO = '1b363ac776f359';
const SAL = 'neofluxo-demo:';

type Json = any;

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'PROJETISTA' | 'ANALISTA' | 'ADMIN';
  department?: string | null;
  active: boolean;
  createdAt: string;
  senhaHash?: string; // só para quem se cadastrou na demonstração
}

interface MockDb {
  users: MockUser[];
  projects: Json[];
  reviews: Json[];
  demandFactors: DemandFactor[];
  transformers: Json[];
}

// ---------------------------------------------------------------------------
// Persistência
// ---------------------------------------------------------------------------

let db: MockDb | null = null;

function carregar(): MockDb {
  if (db) return db;
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (raw) {
      db = JSON.parse(raw) as MockDb;
      return db;
    }
  } catch {
    // localStorage indisponível ou corrompido: recomeça do seed
  }
  const { _origem, ...dados } = seed as Json;
  db = JSON.parse(JSON.stringify(dados)) as MockDb;
  salvar();
  return db;
}

function salvar() {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
  } catch {
    // sem localStorage: a demonstração segue só em memória
  }
}

/** Apaga os dados da demonstração (o próximo acesso recomeça do seed). */
export function restaurarDadosDemo() {
  db = null;
  try {
    localStorage.removeItem(MOCK_STORAGE_KEY);
  } catch {
    // ignora
  }
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function cyrb53(str: string, seedNum = 0): string {
  let h1 = 0xdeadbeef ^ seedNum;
  let h2 = 0x41c6ce57 ^ seedNum;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

const hashSenha = (senha: string) => cyrb53(SAL + senha);

/** UUID v4 com getRandomValues (crypto.randomUUID exige contexto seguro). */
function uuid(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const agora = () => new Date().toISOString();
const round2 = (v: number) => Math.round(v * 100) / 100;

class ApiErro extends Error {
  constructor(public status: number, message: string, public details?: Json) {
    super(message);
  }
}

const REASON: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
};

function resposta(status: number, body?: Json): Response {
  if (status === 204 || body === undefined) return new Response(null, { status });
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

// Mesmo corpo do ApiExceptionHandler.buildResponse
function respostaErro(e: ApiErro): Response {
  const body: Json = { timestamp: agora(), status: e.status, error: REASON[e.status] || 'Error', message: e.message };
  if (e.details) body.details = e.details;
  return resposta(e.status, body);
}

const naoEncontrado = (msg: string) => new ApiErro(404, msg);
const negado = (msg: string) => new ApiErro(403, msg);
const invalido = (msg: string) => new ApiErro(400, msg);

// ---------------------------------------------------------------------------
// Usuários e sessão
// ---------------------------------------------------------------------------

const userView = (u: MockUser) => ({ id: u.id, name: u.name, email: u.email, role: u.role, department: u.department ?? null });

// Formato que a tela de Usuários usa (papel em minúsculo, como em mockData)
const userLista = (u: MockUser) => ({ ...userView(u), role: u.role.toLowerCase(), active: u.active });

function tokenDe(u: MockUser) {
  return `demo.${u.id}.${Date.now().toString(36)}`; // token falso: só carrega o id
}

function usuarioDoToken(headers: Record<string, string>): MockUser | null {
  const auth = headers.Authorization || headers.authorization;
  if (!auth?.startsWith('Bearer demo.')) return null;
  const id = auth.slice('Bearer demo.'.length).split('.')[0];
  return carregar().users.find((u) => u.id === id && u.active) ?? null;
}

function porId(id: string): MockUser {
  const u = carregar().users.find((x) => x.id === id);
  if (!u) throw naoEncontrado('Usuário não encontrado');
  return u;
}

const podeAnalisar = (u: MockUser) => u.role === 'ANALISTA' || u.role === 'ADMIN';
const ehAdmin = (u: MockUser) => u.role === 'ADMIN';

function exigirAdmin(u: MockUser) {
  if (!ehAdmin(u)) throw negado('Somente administradores podem gerenciar este cadastro');
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+$/; // mesma folga do @Email do Bean Validation

function login(body: Json) {
  const email = String(body?.email ?? '').trim();
  const password = String(body?.password ?? '');
  const erros: Record<string, string> = {};
  if (!email) erros.email = 'must not be blank';
  else if (!EMAIL_RE.test(email)) erros.email = 'must be a well-formed email address';
  if (!password) erros.password = 'must not be blank';
  if (Object.keys(erros).length) throw new ApiErro(400, 'Erro de validação nos campos informados', erros);

  const u = carregar().users.find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!u) throw new ApiErro(401, 'Credenciais inválidas');
  if (!u.active) throw new ApiErro(401, 'Conta de usuário inativa. Contate o administrador do sistema.');
  const esperado = u.senhaHash ?? HASH_SENHA_DEMO;
  if (hashSenha(password) !== esperado) throw new ApiErro(401, 'Credenciais inválidas');
  return { token: tokenDe(u), user: userView(u) };
}

function registrar(body: Json) {
  const name = String(body?.name ?? '').trim();
  const email = String(body?.email ?? '').trim();
  const password = String(body?.password ?? '');
  const erros: Record<string, string> = {};
  if (!name) erros.name = 'O nome é obrigatório';
  else if (name.length < 3) erros.name = 'O nome deve ter no mínimo 3 caracteres';
  if (!email) erros.email = 'O e-mail é obrigatório';
  else if (!EMAIL_RE.test(email)) erros.email = 'E-mail em formato inválido';
  if (!password) erros.password = 'A senha é obrigatória';
  else if (password.length < 6) erros.password = 'A senha deve ter no mínimo 6 caracteres';
  if (Object.keys(erros).length) throw new ApiErro(400, 'Erro de validação nos campos informados', erros);

  const banco = carregar();
  if (banco.users.some((x) => x.email.toLowerCase() === email.toLowerCase())) {
    throw invalido('Já existe usuário cadastrado com este e-mail');
  }
  const roles = ['PROJETISTA', 'ANALISTA', 'ADMIN'];
  const pedido = String(body?.role ?? '').toUpperCase();
  const u: MockUser = {
    id: uuid(),
    name,
    email: email.toLowerCase(),
    role: (roles.includes(pedido) ? pedido : 'PROJETISTA') as MockUser['role'],
    department: body?.department ? String(body.department).trim() : 'Projetos Elétricos',
    active: true,
    createdAt: agora(),
    senhaHash: hashSenha(password),
  };
  banco.users.push(u);
  salvar();
  return { token: tokenDe(u), user: userView(u) };
}

// ---------------------------------------------------------------------------
// Cálculo (calcEngine do front, com os fatores de demanda do banco da demonstração)
// ---------------------------------------------------------------------------

function memoriaDeCalculo(units: ConsumerUnitGroup[], services: ServiceLoad[], fatores: DemandFactor[]) {
  const memoria: Json[] = [];
  for (const g of units) {
    const unitCount = Math.max(1, Number(g.unitCount) || 1);
    for (const load of g.loads || []) {
      const r = calculateUnitDemand({ ...g, unitCount: 1, loads: [load] }, fatores);
      const potW = load.quantity * load.powerPerUnit;
      const fator = r.installedPower > 0 ? r.demand / r.installedPower : 1;
      memoria.push({
        group: g.name || 'Grupo',
        category: load.type,
        description: `${load.label} (${load.quantity}x ${load.powerPerUnit}W)`,
        unitsAffected: unitCount,
        individualPowerW: potW,
        totalPowerKw: round2((potW * unitCount) / 1000),
        demandFactor: round2(fator),
        ruleReference: `DIS-NOR-030: Fator ${Math.round(fator * 100)}% para ${load.type}`,
        resultDemandKw: round2(r.demand * unitCount),
      });
    }
  }
  for (const s of services) {
    const r = calculateServiceLoads([s], fatores);
    const potW = s.quantity * s.power;
    const fator = r.installedPower > 0 ? r.demand / r.installedPower : 1;
    memoria.push({
      group: 'Cargas de Serviço / Condomínio',
      category: s.category,
      description: `${s.name} (${s.quantity}x ${s.power}W)`,
      unitsAffected: 1,
      individualPowerW: potW,
      totalPowerKw: round2(potW / 1000),
      demandFactor: round2(fator),
      ruleReference: `DIS-NOR-030 (Áreas Comuns): Fator ${Math.round(fator * 100)}% para ${s.category}`,
      resultDemandKw: round2(r.demand),
    });
  }
  return memoria;
}

/** Equivale a CalculationService.calculateForProject + campos extras de CalculationResponse. */
function calcularProjeto(p: Json) {
  const fatores = carregar().demandFactors;
  const units: ConsumerUnitGroup[] = Array.isArray(p.units) ? p.units : [];
  const services: ServiceLoad[] = Array.isArray(p.serviceLoads) ? p.serviceLoads : [];
  const base = calculateProjectDemand(units, services, fatores);
  const kva = round2(base.calculatedDemand / 0.92);
  const padroes = [75, 112.5, 150, 225, 300, 500, 750, 1000];
  const resultado = {
    ...base,
    calculationMemory: memoriaDeCalculo(units, services, fatores),
    calculatedAt: agora(),
    calculatedDemandKva: kva,
    powerFactor: 0.92,
    recommendedTransformerKva: base.needsSubstation ? padroes.find((s) => s >= kva) ?? 1000 : null,
    simultaneityFactor: base.totalInstalledPower > 0 ? Math.round((base.calculatedDemand / base.totalInstalledPower) * 1000) / 1000 : 1,
  };
  p.calcResult = resultado;
  return resultado;
}

// ---------------------------------------------------------------------------
// Projetos (ProjectService)
// ---------------------------------------------------------------------------

function projeto(id: string): Json {
  const p = carregar().projects.find((x) => x.id === id);
  if (!p) throw naoEncontrado('Projeto não encontrado');
  return p;
}

function checarDono(p: Json, u: MockUser, podeVer: boolean) {
  if (!podeVer && p.projetistaId !== u.id) throw negado('Projeto pertence a outro projetista');
}

function historico(p: Json, action: string, user: string, detail?: string) {
  if (!Array.isArray(p.history)) p.history = [];
  const item: Json = { id: uuid(), date: agora(), action, user: user ?? '' };
  if (detail != null) item.detail = detail;
  p.history.push(item);
}

function gravar(p: Json) {
  p.updatedAt = agora();
  salvar();
  return p;
}

const vazio = (v: Json) => v == null || (typeof v === 'object' && Object.keys(v).length === 0);

function ano() {
  return String(new Date().getFullYear());
}

function codigoAtestado(): string {
  const projetos = carregar().projects;
  let code: string;
  do {
    code = `AT-${ano()}-${uuid().slice(0, 8).toUpperCase()}`;
  } while (projetos.some((p) => p.certificateCode === code));
  return code;
}

function novoAtestado(p: Json, emissor: MockUser) {
  const now = agora();
  const code = codigoAtestado();
  const validationUrl = `/certificates/validate/${code}`;
  return {
    code,
    now,
    certificate: {
      id: uuid(),
      code,
      projectId: p.id,
      projectCode: p.code,
      issueDate: now,
      uniqueIdentifier: `NEO-AT-${ano()}-${uuid().slice(0, 12).toUpperCase()}`,
      analystId: emissor.id,
      analystName: emissor.name,
      validationUrl,
      qrCodeData: validationUrl,
    },
  };
}

function criarProjeto(u: MockUser, body: Json) {
  const now = agora();
  const p: Json = {
    id: uuid(),
    code: `PE-${uuid().slice(0, 8).toUpperCase()}`,
    projetistaId: u.id,
    projetistaName: u.name,
    status: 'rascunho',
    currentStep: 1,
    data: body ?? {},
    units: null,
    serviceLoads: null,
    calcResult: null,
    subestacao: null,
    review: null,
    rejection: null,
    history: [],
    certificate: null,
    atestado: null,
    certificateCode: null,
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
    analyzedAt: null,
    approvedAt: null,
  };
  historico(p, 'Rascunho do projeto criado', u.name, 'Etapa 1 iniciada');
  carregar().projects.push(p);
  return gravar(p);
}

function salvarEtapa(p: Json, u: MockUser, step: number, body: Json) {
  checarDono(p, u, ehAdmin(u));
  if (p.status !== 'rascunho' && p.status !== 'reprovado') {
    throw invalido('Somente projetos em rascunho ou reprovados podem ser editados');
  }
  if (!(step >= 1 && step <= 6)) throw invalido('A etapa deve estar entre 1 e 6');
  if (body?.data != null) p.data = body.data;
  if (body?.units != null) p.units = body.units;
  if (body?.serviceLoads != null) p.serviceLoads = body.serviceLoads;
  if (body?.subestacao != null) p.subestacao = body.subestacao;
  if (body?.review != null) p.review = body.review;
  if (body?.calcResult != null) p.calcResult = body.calcResult;
  else if (body?.units != null || body?.serviceLoads != null) calcularProjeto(p); // demanda e enquadramento já na etapa
  p.currentStep = step;
  historico(p, `Etapa ${step} salva`, u.name, 'Salvamento de rascunho');
  return gravar(p);
}

function enviar(p: Json, u: MockUser) {
  checarDono(p, u, false);
  if (p.status !== 'rascunho' && p.status !== 'reprovado') {
    throw invalido('Somente rascunhos ou projetos reprovados podem ser enviados para análise');
  }
  if (vazio(p.data)) throw invalido('Dados de identificação do projeto não preenchidos (Etapa 1)');
  if (vazio(p.calcResult) || p.calcResult.calculatedDemand == null) calcularProjeto(p);
  const reenvio = p.status === 'reprovado';
  p.status = 'enviado_analise';
  p.currentStep = 6;
  p.submittedAt = agora();
  p.analyzedAt = null;
  p.approvedAt = null;
  historico(
    p,
    reenvio ? 'Projeto reenviado para análise técnica' : 'Projeto enviado para análise técnica',
    u.name,
    'Aguardando parecer da equipe de engenharia',
  );
  return gravar(p);
}

function registrarParecer(p: Json, analista: MockUser, decision: string, reason: string, observations: string, certificateCode: string | null, data: string) {
  carregar().reviews.unshift({
    id: uuid(),
    projectId: p.id,
    projectCode: p.code,
    analystId: analista.id,
    analystName: analista.name,
    decision,
    reason,
    observations,
    certificateCode,
    createdAt: data,
  });
}

function aprovar(p: Json, u: MockUser, body: Json) {
  if (!podeAnalisar(u)) throw negado('Somente analistas ou administradores podem analisar projetos');
  if (p.status !== 'enviado_analise' && p.status !== 'em_analise') {
    throw invalido('Somente projetos enviados ou em análise podem ser aprovados');
  }
  const { code, now, certificate } = novoAtestado(p, u);
  p.status = 'aprovado';
  p.analyzedAt = now;
  p.approvedAt = now;
  p.certificate = certificate;
  p.atestado = certificate;
  p.certificateCode = code;
  p.rejection = null;
  const justificativa = String(body?.justification ?? '').trim() ||
    'Conformidade técnica atestada com os critérios regulamentares DIS-NOR-030 e DIS-NOR-053 da Neoenergia Pernambuco.';
  registrarParecer(p, u, 'APROVADO', justificativa, body?.observations ?? '', code, now);
  historico(p, 'Projeto aprovado', u.name, `Parecer Técnico Favorável — Atestado: ${code}`);
  return gravar(p);
}

function reprovar(p: Json, u: MockUser, body: Json) {
  if (!podeAnalisar(u)) throw negado('Somente analistas ou administradores podem analisar projetos');
  if (p.status !== 'enviado_analise' && p.status !== 'em_analise') {
    throw invalido('Somente projetos enviados ou em análise podem ser reprovados');
  }
  const reason = String(body?.reason ?? '').trim();
  if (!reason) throw new ApiErro(400, 'Erro de validação nos campos informados', { reason: 'O motivo da reprovação é obrigatório' });
  const observations = String(body?.observations ?? '').trim();
  const now = agora();
  p.status = 'reprovado';
  p.analyzedAt = now;
  p.approvedAt = null;
  p.rejection = { reason, observations, analyst: u.name, analystId: u.id, date: now };
  p.certificate = null;
  p.atestado = null;
  p.certificateCode = null;
  registrarParecer(p, u, 'REPROVADO', reason, observations, null, now);
  historico(p, 'Projeto reprovado', u.name, `Parecer Técnico Desfavorável: ${reason}`);
  return gravar(p);
}

function emitirAtestado(p: Json, u: MockUser) {
  if (p.projetistaId !== u.id && !podeAnalisar(u)) throw negado('Permissão negada para emitir o atestado deste projeto');
  if (p.certificateCode && p.certificate) return p;
  if (vazio(p.calcResult) || p.calcResult.calculatedDemand == null) calcularProjeto(p);
  const { code, now, certificate } = novoAtestado(p, u);
  if (p.status === 'rascunho') p.status = 'aprovado';
  p.approvedAt = now;
  p.certificate = certificate;
  p.atestado = certificate;
  p.certificateCode = code;
  historico(p, 'Atestado Técnico emitido com sucesso', u.name, `Atestado: ${code}`);
  return gravar(p);
}

function validarAtestado(code: string) {
  const c = code.toLowerCase();
  const p = carregar().projects.find(
    (x) => (x.certificateCode && String(x.certificateCode).toLowerCase() === c) ||
      (x.certificate?.uniqueIdentifier && String(x.certificate.uniqueIdentifier).toLowerCase() === c),
  );
  if (!p || !p.certificate) {
    return resposta(404, { valid: false, message: 'Atestado não encontrado ou código inválido' });
  }
  return resposta(200, {
    valid: true,
    certificate: p.certificate,
    project: {
      id: p.id,
      code: p.code,
      name: p.data?.name ?? '',
      technicalResponsible: p.data?.technicalResponsible ?? '',
      calculatedDemand: p.calcResult?.calculatedDemand ?? 0,
      enquadramento: p.calcResult?.enquadramento ?? 'baixa_tensao',
      normaAplicada: p.calcResult?.normaAplicada ?? 'DIS-NOR-030',
      approvedAt: p.approvedAt ?? '',
    },
  });
}

// ---------------------------------------------------------------------------
// Roteador
// ---------------------------------------------------------------------------

function rotear(metodo: string, caminho: string, headers: Record<string, string>, body: Json): Response {
  const banco = carregar();
  const seg = caminho.split('?')[0].split('/').filter(Boolean);
  const [raiz, a, b] = seg;

  // ---- Rotas públicas (SecurityConfig: /auth/** e /certificates/validate/**)
  if (raiz === 'auth') {
    if (metodo === 'POST' && a === 'login') return resposta(200, login(body));
    if (metodo === 'POST' && a === 'register') return resposta(201, registrar(body));
    if (metodo === 'POST' && a === 'forgot-password') {
      return resposta(200, { message: 'Se o e-mail estiver cadastrado, o link de recuperação foi enviado' });
    }
    if (metodo === 'GET' && a === 'me') {
      const u = usuarioDoToken(headers);
      if (!u) throw invalido('Usuário não autenticado');
      return resposta(200, userView(porId(u.id)));
    }
  }
  if (raiz === 'certificates' && a === 'validate' && b && metodo === 'GET') return validarAtestado(decodeURIComponent(b));

  // ---- Daqui pra frente exige login (sem token válido o Spring devolve 403 vazio)
  const u = usuarioDoToken(headers);
  if (!u) return resposta(403, { timestamp: agora(), status: 403, error: 'Forbidden', path: '/' + seg.join('/') });

  if (raiz === 'projects') {
    if (!a) {
      if (metodo === 'GET') {
        const lista = podeAnalisar(u)
          ? banco.projects
          : banco.projects.filter((p) => p.projetistaId === u.id).sort((x, y) => String(y.updatedAt).localeCompare(String(x.updatedAt)));
        return resposta(200, lista);
      }
      if (metodo === 'POST') return resposta(201, criarProjeto(u, body));
    } else {
      const p = projeto(a);
      if (!b) {
        if (metodo === 'GET') {
          checarDono(p, u, podeAnalisar(u));
          return resposta(200, p);
        }
        if (metodo === 'PUT') {
          checarDono(p, u, ehAdmin(u));
          p.data = body;
          return resposta(200, gravar(p));
        }
        if (metodo === 'DELETE') {
          checarDono(p, u, ehAdmin(u));
          if (p.status !== 'rascunho') throw invalido('Somente rascunhos podem ser excluídos');
          banco.projects = banco.projects.filter((x) => x.id !== p.id);
          salvar();
          return resposta(204);
        }
      }
      if (b === 'steps' && metodo === 'PUT') {
        const step = Number(seg[3]);
        if (!(step >= 1 && step <= 6)) throw invalido('A etapa deve estar entre 1 e 6');
        return resposta(200, salvarEtapa(p, u, step, body));
      }
      if (b === 'draft' && metodo === 'PUT') {
        const step = Number(body?.step) >= 1 && Number(body?.step) <= 6 ? Number(body.step) : 1;
        return resposta(200, salvarEtapa(p, u, step, body));
      }
      if (b === 'submit' && metodo === 'POST') return resposta(200, enviar(p, u));
      if (b === 'approve' && metodo === 'POST') return resposta(200, aprovar(p, u, body));
      if (b === 'reject' && metodo === 'POST') return resposta(200, reprovar(p, u, body));
      if (b === 'emit-atestado' && metodo === 'POST') return resposta(200, emitirAtestado(p, u));
      if (b === 'calculate' && metodo === 'POST') {
        checarDono(p, u, podeAnalisar(u));
        const r = calcularProjeto(p);
        gravar(p);
        return resposta(200, r);
      }
      if (b === 'calculation-memory' && metodo === 'GET') {
        checarDono(p, u, podeAnalisar(u));
        if (p.calcResult?.calculationMemory) return resposta(200, p.calcResult.calculationMemory);
        const r = calcularProjeto(p);
        gravar(p);
        return resposta(200, r.calculationMemory);
      }
      if (b === 'reviews' && metodo === 'GET') {
        checarDono(p, u, podeAnalisar(u));
        return resposta(200, banco.reviews.filter((r) => r.projectId === p.id));
      }
    }
  }

  // ---- Cadastros do admin. O back Java ainda não tem estas rotas; aqui funcionam só para administrador.
  if (raiz === 'users') {
    exigirAdmin(u);
    if (!a && metodo === 'GET') return resposta(200, banco.users.map(userLista));
    if (!a && metodo === 'POST') {
      const email = String(body?.email ?? '').trim().toLowerCase();
      if (!body?.name || !EMAIL_RE.test(email)) throw invalido('Nome e e-mail válidos são obrigatórios');
      if (banco.users.some((x) => x.email === email)) throw invalido('Já existe usuário cadastrado com este e-mail');
      const novo: MockUser = {
        id: uuid(),
        name: String(body.name).trim(),
        email,
        role: (String(body.role ?? 'projetista').toUpperCase() as MockUser['role']),
        department: body.department ?? null,
        active: body.active ?? true,
        createdAt: agora(),
      };
      banco.users.push(novo);
      salvar();
      return resposta(201, userLista(novo));
    }
    if (a) {
      const alvo = porId(a);
      if (metodo === 'GET') return resposta(200, userLista(alvo));
      if (metodo === 'PUT') {
        if (body?.name) alvo.name = String(body.name).trim();
        if (body?.email) alvo.email = String(body.email).trim().toLowerCase();
        if (body?.role) alvo.role = String(body.role).toUpperCase() as MockUser['role'];
        if (body?.department !== undefined) alvo.department = body.department;
        if (typeof body?.active === 'boolean') alvo.active = body.active;
        salvar();
        return resposta(200, userLista(alvo));
      }
      if (metodo === 'DELETE') {
        if (alvo.id === u.id) throw invalido('Você não pode excluir o próprio usuário');
        banco.users = banco.users.filter((x) => x.id !== alvo.id);
        salvar();
        return resposta(204);
      }
    }
  }

  if (raiz === 'demand-factors') {
    if (!a && metodo === 'GET') return resposta(200, banco.demandFactors);
    exigirAdmin(u);
    if (!a && metodo === 'POST') {
      const novo = { ...body, id: `df-${Date.now().toString(36)}` };
      banco.demandFactors.push(novo);
      salvar();
      return resposta(201, novo);
    }
    if (a && metodo === 'PUT') {
      const i = banco.demandFactors.findIndex((f) => f.id === a);
      if (i < 0) throw naoEncontrado('Fator de demanda não encontrado');
      banco.demandFactors[i] = { ...banco.demandFactors[i], ...body, id: a };
      salvar();
      return resposta(200, banco.demandFactors[i]);
    }
  }

  if (raiz === 'transformers') {
    if (!a && metodo === 'GET') return resposta(200, banco.transformers);
    exigirAdmin(u);
    if (!a && metodo === 'POST') {
      const novo = { ...body, id: `t-${Date.now().toString(36)}` };
      banco.transformers.push(novo);
      salvar();
      return resposta(201, novo);
    }
    if (a) {
      const i = banco.transformers.findIndex((t) => t.id === a);
      if (i < 0) throw naoEncontrado('Transformador não encontrado');
      if (metodo === 'PUT') {
        banco.transformers[i] = { ...banco.transformers[i], ...body, id: a };
        salvar();
        return resposta(200, banco.transformers[i]);
      }
      if (metodo === 'DELETE') {
        banco.transformers.splice(i, 1);
        salvar();
        return resposta(204);
      }
    }
  }

  // Rota que o back não tem (ex.: /firebase/status): a tela já trata o erro
  throw naoEncontrado(`Rota não existe na demonstração: ${metodo} /${seg.join('/')}`);
}

/** Substituto do fetch usado pelo fetchApi no modo demonstração. */
export async function mockFetch(endpoint: string, init: RequestInit = {}): Promise<Response> {
  await new Promise((r) => setTimeout(r, LATENCIA_MS));
  const metodo = (init.method || 'GET').toUpperCase();
  const headers = (init.headers || {}) as Record<string, string>;
  let body: Json = null;
  if (typeof init.body === 'string' && init.body) {
    try {
      body = JSON.parse(init.body);
    } catch {
      return respostaErro(invalido('JSON inválido no corpo da requisição'));
    }
  }
  try {
    return rotear(metodo, endpoint, headers, body);
  } catch (e) {
    if (e instanceof ApiErro) return respostaErro(e);
    return respostaErro(new ApiErro(500, `Erro interno no servidor: ${(e as Error)?.message ?? e}`));
  }
}
