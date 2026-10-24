import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { CheckCircle2, ClipboardCheck, FolderOpen, FolderPlus, LayoutDashboard, Menu, PanelRightClose, PanelRightOpen, Send } from 'lucide-react';
import { Button, IconButton, PillBars, Segmented, StatCard, StatusBadge, SideNav, spring } from '@/ds';

/*
 * Ref 14, literal: o painel se reorganiza animado. Vira celular e volta; fechar o painel da direita
 * faz os cards crescerem pra ocupar o espaço. É a seção protagonista da página.
 */

const NAV = [
  { id: 'painel', label: 'Painel', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { id: 'novo', label: 'Novo projeto', icon: <FolderPlus className="h-[18px] w-[18px]" /> },
  { id: 'meus', label: 'Meus projetos', icon: <FolderOpen className="h-[18px] w-[18px]" />, count: 5 },
  { id: 'fila', label: 'Fila de análise', icon: <ClipboardCheck className="h-[18px] w-[18px]" /> },
];

const ATIVIDADE = [
  { id: 'a', t: 'Residencial Boa Vista', s: 'aprovado' as const, d: 'hoje, 10:42' },
  { id: 'b', t: 'Edifício Capibaribe', s: 'em_analise' as const, d: 'ontem, 16:05' },
  { id: 'c', t: 'Galpão Suape II', s: 'enviado_analise' as const, d: '20/10, 09:30' },
];

export function Reorganiza() {
  const [modo, setModo] = useState<'pc' | 'celular'>('pc');
  const [painel, setPainel] = useState(true);
  const [aba, setAba] = useState('painel');
  const caixa = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(1200);
  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setLargura(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const cel = modo === 'celular';
  // tela estreita não cabe o painel da direita: os cards ficam com o espaço
  const lateral = painel && !cel && largura >= 1000;
  const colunas = cel || largura < 560 ? 'grid-cols-1' : lateral || largura < 900 ? 'grid-cols-2' : 'grid-cols-4';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Tamanho da tela"
          value={modo}
          onChange={(v) => setModo(v as 'pc' | 'celular')}
          items={[
            { value: 'pc', label: 'Computador' },
            { value: 'celular', label: 'Celular' },
          ]}
        />
        <Button variant="secondary" size="sm" disabled={cel || largura < 1000} icon={painel ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />} onClick={() => setPainel((p) => !p)}>
          {painel ? 'Fechar painel da direita' : 'Abrir painel da direita'}
        </Button>
      </div>

      <div ref={caixa} className="flex justify-center overflow-hidden rounded-card bg-surface-3/60 p-3 sm:p-6">
        <motion.div
          animate={{ width: cel ? 390 : 1180, height: cel ? 760 : 640 }}
          transition={spring.layout}
          style={{ maxWidth: '100%' }}
          className="flex overflow-hidden rounded-[32px] bg-canvas shadow-pop ring-1 ring-line"
        >
          <LayoutGroup>
            <AnimatePresence initial={false}>
              {!cel && (
                <motion.div key="nav" initial={{ x: -260, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -260, opacity: 0 }} transition={spring.layout} className="hidden md:block">
                  <SideNav items={NAV} active={aba} onChange={setAba} layoutId="aba-demo" />
                </motion.div>
              )}
            </AnimatePresence>

            <main className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-7">
              <motion.div layout="position" transition={spring.layout} className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">Bom dia, Carlos</p>
                  <h3 className="font-display text-3xl font-medium tracking-tight text-fg">Painel</h3>
                </div>
                {cel ? (
                  <IconButton label="Menu">
                    <Menu className="h-5 w-5" />
                  </IconButton>
                ) : (
                  <Button size="sm" arrow>
                    Novo projeto
                  </Button>
                )}
              </motion.div>

              <div className="flex gap-5">
                <motion.div layout transition={spring.layout} className="min-w-0 flex-1">
                  <div className={`grid gap-4 ${colunas}`}>
                    {[
                      { k: 'and', label: 'Em andamento', value: 2, highlight: true },
                      { k: 'agu', label: 'Aguardando', value: 1 },
                      { k: 'apr', label: 'Aprovados', value: 12, delta: '+3' },
                      { k: 'rep', label: 'Reprovados', value: 1 },
                    ].map((c) => (
                      <motion.div key={c.k} layout transition={spring.layout}>
                        <StatCard inLayout label={c.label} value={c.value} highlight={c.highlight} delta={c.delta} onOpen={() => undefined} />
                      </motion.div>
                    ))}
                  </div>
                  <motion.div layout transition={spring.layout} className="mt-4 rounded-card bg-surface p-5 ring-1 ring-inset ring-line">
                    <motion.div layout="position" transition={spring.layout}>
                    <p className="mb-4 font-display text-lg font-semibold text-fg">Projetos enviados por mês</p>
                    <PillBars
                      height={cel ? 150 : 170}
                      data={[
                        { label: 'Mai', value: 4 },
                        { label: 'Jun', value: 6 },
                        { label: 'Jul', value: 5 },
                        { label: 'Ago', value: 9 },
                        { label: 'Set', value: 7 },
                        { label: 'Out', value: 8 },
                      ]}
                    />
                    </motion.div>
                  </motion.div>
                </motion.div>

                <AnimatePresence initial={false} mode="popLayout">
                  {lateral && (
                    <motion.aside
                      key="lateral"
                      layout
                      initial={{ opacity: 0, x: 60 }}
                      // entra depois que os cards abriram espaço (e o quadro voltou a crescer, vindo do celular)
                      animate={{ opacity: 1, x: 0, transition: { ...spring.layout, delay: 0.32 } }}
                      exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
                      transition={spring.layout}
                      className="w-72 shrink-0 rounded-card bg-surface p-5 ring-1 ring-inset ring-line"
                    >
                      <p className="mb-4 font-display text-lg font-semibold text-fg">Atividade recente</p>
                      <ul className="space-y-3">
                        {ATIVIDADE.map((a) => (
                          <li key={a.id} className="rounded-tile bg-surface-2 p-3.5">
                            <p className="text-sm font-semibold text-fg">{a.t}</p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <StatusBadge status={a.s} />
                              <span className="text-xs text-muted">{a.d}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex items-center gap-3 rounded-tile bg-highlight p-4 text-on-highlight">
                        {ATIVIDADE[0].s === 'aprovado' ? <CheckCircle2 className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                        <p className="text-sm">Atestado NEO-AT-2026-003 emitido</p>
                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>
              </div>
            </main>
          </LayoutGroup>
        </motion.div>
      </div>
    </div>
  );
}
