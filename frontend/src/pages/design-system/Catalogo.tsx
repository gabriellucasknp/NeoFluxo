import { useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Bell, Building2, ClipboardCheck, Download, FolderOpen, FolderPlus, Inbox, LayoutDashboard, Plus, Settings2, ShieldCheck, Trash2, Zap } from 'lucide-react';
import {
  Alert, ArrowButton, Button, ConfirmDialog, DataTable, DemandGauge, Dismissible, EmptyState, IconButton, Logo, MobileNav, Modal,
  PageHeader, Progress, RingStat, SearchField, SectionHeader, Segmented, Select, SideNav, Skeleton, Spinner, StatCard, StatusBadge,
  Stepper, TensionBadge, TextField, UserMenu, rise, type Column, type Status,
} from '@/ds';

/*
 * Catálogo do design system novo: os mesmos 18 elementos da página atual, agora 1 versão de cada.
 * Cada caixa diz quantas versões existiam e de quais refs veio a linguagem.
 */

function Element({ id, title, antes, refs, children }: { id: string; title: string; antes: number; refs: string; children: ReactNode }) {
  return (
    <motion.article
      id={id}
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className="scroll-mt-6 rounded-card bg-surface p-5 ring-1 ring-inset ring-line sm:p-7"
    >
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
          <p className="mt-0.5 text-sm text-muted">Linguagem: {refs}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-fg-2">
          <span className="text-muted line-through">{antes}</span>
          <span aria-hidden>→</span>
          <span className="text-success-fg">1 versão</span>
        </span>
      </header>
      {children}
    </motion.article>
  );
}

/** Fundo da página por trás do exemplo, pra ver o componente onde ele vai morar */
function Stage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-tile bg-canvas p-5 sm:p-6 ${className}`}>{children}</div>;
}

interface Projeto {
  id: string;
  nome: string;
  projetista: string;
  demanda: number;
  status: Status;
  data: string;
}

const PROJETOS: Projeto[] = [
  { id: 'NF-2611', nome: 'Residencial Boa Vista', projetista: 'Carlos Mendes', demanda: 58.4, status: 'aprovado', data: '22/10/2026' },
  { id: 'NF-2612', nome: 'Edifício Capibaribe', projetista: 'Carlos Mendes', demanda: 162, status: 'em_analise', data: '21/10/2026' },
  { id: 'NF-2613', nome: 'Galpão Suape II', projetista: 'Ana Silva', demanda: 96.7, status: 'enviado_analise', data: '20/10/2026' },
  { id: 'NF-2614', nome: 'Clínica Graças', projetista: 'Roberto Fonseca', demanda: 41.2, status: 'reprovado', data: '18/10/2026' },
  { id: 'NF-2615', nome: 'Loja Madalena', projetista: 'Ana Silva', demanda: 22.9, status: 'rascunho', data: '17/10/2026' },
];

const kw = (n: number) => `${n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kW`;

const COLS: Column<Projeto>[] = [
  { key: 'id', header: 'Nº', width: '96px', hideOnMobile: true, cell: (r, on) => <span className={`font-semibold tabular ${on ? '' : 'text-muted'}`}>{r.id}</span>, sort: (r) => r.id },
  {
    key: 'nome',
    header: 'Projeto',
    width: 'minmax(0,2fr)',
    mobileFull: true,
    cell: (r, on) => (
      <span className="block min-w-0">
        <span className={`block truncate font-semibold ${on ? '' : 'text-fg'}`}>{r.nome}</span>
        <span className={`block truncate text-xs ${on ? 'text-on-highlight/75' : 'text-muted'}`}>{r.projetista}</span>
      </span>
    ),
    sort: (r) => r.nome,
  },
  { key: 'dem', header: 'Demanda', cell: (r) => <span className="font-semibold tabular">{kw(r.demanda)}</span>, sort: (r) => r.demanda },
  { key: 'enq', header: 'Enquadramento', hideOnMobile: true, cell: (r, on) => <TensionBadge media={r.demanda > 75} onColor={on} /> },
  { key: 'st', header: 'Status', cell: (r, on) => <span className="flex justify-end md:justify-start"><StatusBadge status={r.status} onColor={on} /></span> },
  { key: 'data', header: 'Enviado em', hideOnMobile: true, align: 'right', cell: (r) => <span className="tabular">{r.data}</span>, sort: (r) => r.data.split('/').reverse().join('') },
];

const STEPS = ['Dados do Projeto', 'Unidades Consumidoras', 'Cargas de Serviço', 'Cálculo e Enquadramento', 'Revisão', 'Atestado'];

const NAV = [
  { id: 'painel', label: 'Painel', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { id: 'novo', label: 'Novo projeto', icon: <FolderPlus className="h-[18px] w-[18px]" /> },
  { id: 'meus', label: 'Meus projetos', icon: <FolderOpen className="h-[18px] w-[18px]" />, count: 5 },
  { id: 'fila', label: 'Fila de análise', icon: <ClipboardCheck className="h-[18px] w-[18px]" /> },
  { id: 'validar', label: 'Validar atestado', icon: <ShieldCheck className="h-[18px] w-[18px]" /> },
];

export function Catalogo() {
  const [busca, setBusca] = useState('');
  const [potencia, setPotencia] = useState('');
  const [carga, setCarga] = useState('');
  const [periodo, setPeriodo] = useState('mensal');
  const [modal, setModal] = useState(false);
  const [confirma, setConfirma] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [alertas, setAlertas] = useState({ a: true, b: true });
  const [passo, setPasso] = useState(2);
  const [aba, setAba] = useState('meus');
  const [carregando, setCarregando] = useState(false);
  const erroPot = potencia !== '' && !(Number(potencia.replace(',', '.')) > 0) ? 'Informe a potência em kW, maior que zero.' : undefined;

  const filtrados = PROJETOS.filter((p) => (filtro === 'todos' ? true : filtro === 'fila' ? ['enviado_analise', 'em_analise'].includes(p.status) : p.status === filtro));

  return (
    <div className="space-y-6">
      <Element id="caixa-de-texto" title="Caixa de texto e busca" antes={6} refs="campos claros e arredondados (1, 2, 11); busca em pílula (7, 10, 12)">
        <Stage className="grid gap-5 md:grid-cols-2">
          <TextField label="Nome do projeto" placeholder="Ex.: Residencial Boa Vista" />
          <TextField
            label="Potência instalada"
            placeholder="0,0"
            inputMode="decimal"
            suffix="kW"
            value={potencia}
            onChange={(e) => setPotencia(e.target.value)}
            error={erroPot}
            hint="Digite letras pra ver o erro tremer."
          />
          <SearchField value={busca} onChange={setBusca} placeholder="Buscar projeto, nº ou projetista" className="md:col-span-2" />
        </Stage>
      </Element>

      <Element id="select" title="Select" antes={4} refs='gatilho em pílula como o "Monthly ⌄" (8, 10)'>
        <Stage className="flex flex-wrap items-end gap-5">
          <div className="w-full max-w-xs">
            <Select
              label="Tipo de carga"
              value={carga}
              onChange={setCarga}
              placeholder="Selecione a carga"
              options={[
                { value: 'iluminacao', label: 'Iluminação' },
                { value: 'tug', label: 'TUG', hint: 'Tomada de Uso Geral' },
                { value: 'tue', label: 'TUE', hint: 'Tomada de Uso Específico' },
                { value: 'motor', label: 'Motor' },
                { value: 'outros', label: 'Outras cargas' },
              ]}
            />
          </div>
          <Select
            pill
            value={periodo}
            onChange={setPeriodo}
            options={[
              { value: 'semanal', label: 'Semanal' },
              { value: 'mensal', label: 'Mensal' },
              { value: 'anual', label: 'Anual' },
            ]}
          />
        </Stage>
      </Element>

      <Element id="modal" title="Modal e confirmação" antes={4} refs="card grande arredondado sobre fundo desfocado (1, 2); confirmação deixa de ser o alerta do navegador">
        <Stage className="flex flex-wrap gap-3">
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModal(true)}>
            Adicionar unidade
          </Button>
          <Button variant="secondary" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirma(true)}>
            Excluir rascunho
          </Button>
        </Stage>
        <Modal
          open={modal}
          onClose={() => setModal(false)}
          title="Adicionar unidade consumidora"
          description="As cargas entram no cálculo da demanda na hora."
          footer={
            <>
              <Button variant="secondary" onClick={() => setModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setModal(false)}>Adicionar</Button>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Identificação" placeholder="Apto 101" />
            <TextField label="Área" placeholder="0" suffix="m²" inputMode="decimal" />
            <TextField label="Carga instalada" placeholder="0,0" suffix="kW" inputMode="decimal" />
            <TextField label="Quantidade" placeholder="1" inputMode="numeric" />
          </div>
        </Modal>
        <ConfirmDialog
          open={confirma}
          onClose={() => setConfirma(false)}
          onConfirm={() => setConfirma(false)}
          danger
          title="Excluir o rascunho?"
          description="O projeto Loja Madalena e as 4 unidades cadastradas saem do sistema. Não dá pra desfazer."
          confirmLabel="Excluir rascunho"
        />
      </Element>

      <Element id="botao" title="Botão" antes={5} refs='pílula cheia como o "Export as CVS ↗" (10) e o "Upgrade" (8)'>
        <Stage className="flex flex-wrap items-center gap-3">
          <Button arrow>Enviar para análise</Button>
          <Button variant="secondary" icon={<Download className="h-4 w-4" />}>
            Baixar atestado
          </Button>
          <Button variant="ghost">Salvar rascunho</Button>
          <Button variant="danger">Reprovar</Button>
          <Button
            loading={carregando}
            onClick={() => {
              setCarregando(true);
              setTimeout(() => setCarregando(false), 1600);
            }}
          >
            {carregando ? 'Calculando' : 'Calcular demanda'}
          </Button>
          <Button size="sm" variant="secondary">
            Pequeno
          </Button>
          <Button disabled>Desativado</Button>
        </Stage>
      </Element>

      <Element id="botao-de-icone" title="Botão só de ícone" antes={6} refs="redondo, e o ↗ que escorrega na diagonal (3, 8, 10)">
        <Stage className="flex flex-wrap items-center gap-3">
          <IconButton label="Notificações">
            <Bell className="h-5 w-5" />
          </IconButton>
          <IconButton label="Filtros" tone="outline">
            <Settings2 className="h-5 w-5" />
          </IconButton>
          <IconButton label="Novo projeto" tone="solid">
            <Plus className="h-5 w-5" />
          </IconButton>
          <ArrowButton label="Abrir detalhe" />
          <span className="flex items-center gap-3 rounded-full bg-highlight py-1.5 pl-5 pr-1.5 text-sm font-medium text-on-highlight">
            No card azul
            <ArrowButton label="Abrir no card azul" tone="onColor" />
          </span>
        </Stage>
      </Element>

      <Element id="filtros-e-abas" title="Filtros e abas" antes={4} refs="trilho em pílula com a opção ativa clara que escorrega (3, 6, 9, 12)">
        <Stage className="space-y-4">
          <Segmented
            label="Filtrar projetos"
            value={filtro}
            onChange={setFiltro}
            items={[
              { value: 'todos', label: 'Todos', count: PROJETOS.length },
              { value: 'fila', label: 'Na fila', count: 2 },
              { value: 'aprovado', label: 'Aprovados', count: 1 },
              { value: 'reprovado', label: 'Reprovados', count: 1 },
            ]}
          />
        </Stage>
      </Element>

      <Element id="cabecalho-de-pagina" title="Cabeçalho de página" antes={5} refs="título grande em duas linhas e números soltos ao lado (3, 5, 6, 9)">
        <Stage>
          <PageHeader
            greeting="Bom dia, Ana"
            title="Fila de análise"
            stats={[
              { label: 'Na fila', value: '3' },
              { label: 'Demanda em análise', value: '258,7', unit: 'kW' },
              { label: 'Prazo médio', value: '2,4', unit: 'dias' },
            ]}
          />
        </Stage>
      </Element>

      <Element id="cabecalho-de-secao" title="Cabeçalho de seção" antes={2} refs="título + apoio, pílula de período e ↗ à direita (5, 8, 10)">
        <Stage>
          <div className="rounded-card bg-surface p-5 ring-1 ring-inset ring-line">
            <SectionHeader
              icon={<Zap className="h-5 w-5" />}
              title="Demanda por enquadramento"
              subtitle="Projetos enviados nos últimos 6 meses"
              actions={
                <>
                  <Select pill value={periodo} onChange={setPeriodo} options={[{ value: 'mensal', label: 'Mensal' }, { value: 'anual', label: 'Anual' }]} />
                  <ArrowButton label="Abrir relatório" size="sm" />
                </>
              }
            />
          </div>
        </Stage>
      </Element>

      <Element id="card-de-numero" title="Card de número" antes={2} refs="número gigante e fino (3, 9); um card destacado por linha (7, 8, 10); anel em pílula (2, 9)">
        <Stage className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Em andamento" value={2} note="1 aguardando análise" highlight onOpen={() => undefined} />
            <StatCard label="Aprovados" value={12} delta="+3" note="este mês" onOpen={() => undefined} />
            <StatCard label="Demanda total" value={381.2} decimals={1} unit="kW" note="5 projetos" onOpen={() => undefined} />
            <StatCard label="Reprovados" value={1} delta="-2" note="vs. setembro" onOpen={() => undefined} />
          </div>
          <div className="flex flex-wrap gap-4">
            <RingStat label="Aprovados de primeira" percent={67} />
            <RingStat label="Análises no prazo" percent={92} tone="success" />
          </div>
        </Stage>
      </Element>

      <Element id="bloco-de-demanda" title="Bloco de demanda" antes={7} refs='medidor em arco com a setinha do "832" (4)'>
        <Stage className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-card bg-surface p-6 ring-1 ring-inset ring-line">
            <DemandGauge demand={162} />
          </div>
          <div className="rounded-card bg-surface p-6 ring-1 ring-inset ring-line">
            <DemandGauge demand={58.4} />
          </div>
        </Stage>
      </Element>

      <Element id="tabela" title="Tabela" antes={3} refs="linhas em faixa arredondada (7, 11); a escolhida salta em azul (13)">
        <Stage>
          <DataTable
            rows={filtrados}
            columns={COLS}
            rowKey={(r) => r.id}
            empty={
              <EmptyState icon={<Inbox className="h-6 w-6" />} title="Nada nesse filtro">
                Troque o filtro em "Filtros e abas".
              </EmptyState>
            }
          />
          <p className="mt-3 text-xs text-muted">Clique numa linha. O filtro de "Filtros e abas" também vale aqui.</p>
        </Stage>
      </Element>

      <Element id="badge" title="Badge" antes={6} refs="status em pílula com ponto (7, 11, 13)">
        <Stage className="flex flex-wrap gap-2">
          {(['rascunho', 'enviado_analise', 'em_analise', 'aprovado', 'reprovado'] as Status[]).map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
          <TensionBadge media={false} />
          <TensionBadge media />
        </Stage>
      </Element>

      <Element id="alerta" title="Alerta" antes={4} refs="card suave com ícone redondo, sem borda lateral (8, 11)">
        <Stage className="space-y-3">
          <Dismissible show={alertas.a}>
            <Alert tone="warning" title="Projeto em Média Tensão" onClose={() => setAlertas((a) => ({ ...a, a: false }))}>
              A demanda de 162,0 kW passa do limite de 75 kW. Vale a DIS-NOR-053 e o projeto precisa de transformador.
            </Alert>
          </Dismissible>
          <Dismissible show={alertas.b}>
            <Alert tone="success" title="Projeto homologado" onClose={() => setAlertas((a) => ({ ...a, b: false }))}>
              Atestado digital NEO-AT-2026-003 emitido.
            </Alert>
          </Dismissible>
          <Alert tone="danger" title="Reprovado na análise">
            Falta o memorial de cargas da área comum.
          </Alert>
          <Alert tone="info" title="Cálculo pela DIS-NOR-030" />
          {(!alertas.a || !alertas.b) && (
            <Button size="sm" variant="secondary" onClick={() => setAlertas({ a: true, b: true })}>
              Mostrar de novo
            </Button>
          )}
        </Stage>
      </Element>

      <Element id="estado-vazio" title="Estado vazio" antes={4} refs='o "+ Add Activity" tracejado (1)'>
        <Stage>
          <EmptyState icon={<FolderPlus className="h-6 w-6" />} title="Nenhum projeto ainda" action={<Button arrow>Criar primeiro projeto</Button>}>
            Comece pelo memorial de cargas. A demanda e o enquadramento saem sozinhos.
          </EmptyState>
        </Stage>
      </Element>

      <Element id="carregando" title="Carregando" antes={4} refs="barra em pílula (1, 9)">
        <Stage className="grid gap-5 md:grid-cols-2">
          <div className="space-y-3 rounded-card bg-surface p-5 ring-1 ring-inset ring-line">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="space-y-5 rounded-card bg-surface p-5 ring-1 ring-inset ring-line">
            <Spinner label="Calculando a demanda" />
            <Progress label="Envio dos documentos" value={72} detail="3 de 4" />
          </div>
        </Stage>
      </Element>

      <Element id="logo" title="Logo" antes={6} refs="marca no quadrado arredondado, branca sobre o menu azul (7, 13)">
        <Stage className="flex flex-wrap items-center gap-6">
          <Logo />
          <span className="rounded-card bg-nav px-5 py-4">
            <Logo onNav />
          </span>
          <Logo compact />
        </Stage>
      </Element>

      <Element id="menus" title="Menus" antes={3} refs="menu azul cheio com o item ativo numa aba que sai dele (7, 13); usuário em pílula (8, 9)">
        <div className="flex h-[420px] overflow-hidden rounded-tile ring-1 ring-inset ring-line">
          <div className="hidden sm:flex">
            <SideNav items={NAV} active={aba} onChange={setAba} layoutId="aba-catalogo" footer={<p className="text-xs text-on-nav/70">Clique nos itens</p>} />
          </div>
          <div className="flex flex-1 flex-col bg-canvas p-5">
            <div className="flex items-center justify-between gap-3">
              <MobileNav items={NAV} active={aba} onChange={setAba} />
              <UserMenu name="Carlos Mendes" role="Projetista" />
            </div>
            <div className="mt-6 flex-1 rounded-card bg-surface p-5 ring-1 ring-inset ring-line">
              <p className="font-display text-2xl font-medium text-fg">{NAV.find((n) => n.id === aba)?.label}</p>
              <p className="mt-1 text-sm text-muted">O botão de menu à esquerda é o do celular.</p>
              <div className="mt-5 flex items-center gap-3 text-muted">
                <Building2 className="h-5 w-5" />
                <span className="text-sm">Conteúdo da tela</span>
              </div>
            </div>
          </div>
        </div>
      </Element>

      <Element id="stepper" title="Stepper" antes={1} refs="passos em pílula e trilho que enche (1, 9)">
        <Stage className="space-y-6">
          <Stepper steps={STEPS} current={passo} onStep={setPasso} />
          <div className="flex justify-between">
            <Button variant="secondary" size="sm" disabled={passo === 0} onClick={() => setPasso((p) => p - 1)}>
              Voltar
            </Button>
            <Button size="sm" arrow disabled={passo === STEPS.length - 1} onClick={() => setPasso((p) => p + 1)}>
              Próximo passo
            </Button>
          </div>
        </Stage>
      </Element>
    </div>
  );
}
