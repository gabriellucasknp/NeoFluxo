import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button, Logo } from '@/ds';
import { Reorganiza } from './Reorganiza';
import { Catalogo } from './Catalogo';
import { Graficos } from './Graficos';
import { Tokens } from './Tokens';

/*
 * /design-system — o design system NOVO do NeoFluxo, montado das refs da pasta Dashboard.
 * O retrato de como está hoje fica na branch ds-atual (porta 5175), pra comparar.
 */

const ELEMENTOS: [string, string][] = [
  ['caixa-de-texto', 'Caixa de texto e busca'],
  ['select', 'Select'],
  ['modal', 'Modal e confirmação'],
  ['botao', 'Botão'],
  ['botao-de-icone', 'Botão só de ícone'],
  ['filtros-e-abas', 'Filtros e abas'],
  ['cabecalho-de-pagina', 'Cabeçalho de página'],
  ['cabecalho-de-secao', 'Cabeçalho de seção'],
  ['card-de-numero', 'Card de número'],
  ['bloco-de-demanda', 'Bloco de demanda'],
  ['tabela', 'Tabela'],
  ['badge', 'Badge'],
  ['alerta', 'Alerta'],
  ['estado-vazio', 'Estado vazio'],
  ['carregando', 'Carregando'],
  ['logo', 'Logo'],
  ['menus', 'Menus'],
  ['stepper', 'Stepper'],
];

const ANTES = 'http://localhost:5175/design-system';

function Section({ id, title, intro, children }: { id: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 space-y-6">
      <div>
        <h2 className="font-display text-3xl font-medium tracking-tight text-fg">{title}</h2>
        {intro && <p className="mt-2 max-w-3xl text-sm text-muted">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

export function DesignSystemPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-canvas">
        <div className="mx-auto flex max-w-[1440px] gap-10 px-4 py-8 lg:px-8">
          <aside className="sticky top-8 hidden h-[calc(100vh-4rem)] w-56 shrink-0 overflow-y-auto lg:block">
            <div className="mb-8">
              <Logo />
            </div>
            <nav className="space-y-5 text-sm">
              <a href="#reorganiza" className="block font-semibold text-fg hover:text-accent-fg">
                Painel que se reorganiza
              </a>
              <div>
                <a href="#catalogo" className="font-semibold text-fg hover:text-accent-fg">
                  Catálogo
                </a>
                <ul className="mt-2 space-y-0.5">
                  {ELEMENTOS.map(([id, l]) => (
                    <li key={id}>
                      <a href={`#${id}`} className="block rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-surface hover:text-fg">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <a href="#graficos" className="block font-semibold text-fg hover:text-accent-fg">
                Gráficos
              </a>
              <a href="#tokens" className="block font-semibold text-fg hover:text-accent-fg">
                Tokens
              </a>
              <a href="#regra" className="block font-semibold text-fg hover:text-accent-fg">
                A regra
              </a>
            </nav>
          </aside>

          <main className="min-w-0 flex-1 space-y-16">
            <header className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="mb-2 text-sm text-muted">NeoFluxo · design system novo</p>
                <h1 className="max-w-[14ch] font-display text-5xl font-medium leading-[1.02] tracking-tight text-fg sm:text-6xl">Uma versão de cada coisa</h1>
                <p className="mt-4 max-w-2xl text-fg-2">
                  Os 18 elementos que hoje existem em 76 versões, agora com uma só. Azul Neoenergia, modo claro e escuro, e tudo animado.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" arrow onClick={() => window.open(ANTES, '_blank', 'noopener')}>
                  Ver como está hoje
                </Button>
                <ThemeToggle tone="outline" />
              </div>
            </header>

            <Section id="reorganiza" title="Painel que se reorganiza" intro="Ref 14, inteira: troque pra celular e feche o painel da direita. Os cards andam e crescem pra ocupar o espaço.">
              <Reorganiza />
            </Section>

            <Section id="catalogo" title="Catálogo" intro="Tudo responde a hover, clique e teclado. O número riscado é quantas versões o elemento tinha.">
              <Catalogo />
            </Section>

            <Section id="graficos" title="Gráficos" intro="Pizza e barras do 6, área com cartão flutuante do 9. Passe o mouse em tudo.">
              <Graficos />
            </Section>

            <Section id="tokens" title="Tokens">
              <Tokens />
            </Section>

            <Section id="regra" title="A regra">
              <div className="rounded-card bg-surface p-6 ring-1 ring-inset ring-line">
                <p className="max-w-3xl text-fg-2">
                  Tela nova só monta com as peças de <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm">src/ds</code>. Campo, modal, tabela e botão
                  feitos na mão é o que gerou as 76 versões. O <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm">npm run check:ds</code> aponta
                  cada um que escapar.
                </p>
              </div>
            </Section>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
