import { useState } from 'react';
import { motion } from 'motion/react';
import { Button, Card, spring } from '@/ds';

/*
 * Tokens do design system novo: cores por papel (lidas ao vivo, mudam com o tema), texto, forma e movimento.
 */

const CORES: { grupo: string; itens: [string, string][] }[] = [
  {
    grupo: 'Superfícies',
    itens: [
      ['canvas', 'Fundo da página e aba do menu'],
      ['surface', 'Card, painel, modal'],
      ['surface-2', 'Tile, linha, hover'],
      ['surface-3', 'Trilho, segmentado'],
      ['raised', 'Campo, pílula'],
    ],
  },
  {
    grupo: 'Texto e linha',
    itens: [
      ['fg', 'Título e valor'],
      ['fg-2', 'Corpo'],
      ['muted', 'Apoio'],
      ['subtle', 'Placeholder'],
      ['line', 'Fio do card'],
    ],
  },
  {
    grupo: 'Marca',
    itens: [
      ['primary', 'Ação principal'],
      ['highlight', 'Card destacado'],
      ['nav', 'Menu lateral'],
      ['accent-soft', 'Fundo suave da marca'],
      ['accent-fg', 'Texto na cor da marca'],
    ],
  },
  {
    grupo: 'Status',
    itens: [
      ['success', 'Aprovado'],
      ['warning', 'Em análise, Média Tensão'],
      ['danger', 'Reprovado, erro'],
      ['info', 'Aguardando'],
    ],
  },
  {
    grupo: 'Gráficos (ordem fixa)',
    itens: [
      ['chart-1', 'Série e fatia 1'],
      ['chart-2', 'Fatia 2'],
      ['chart-3', 'Fatia 3'],
      ['chart-rest', 'Barra fora de destaque'],
    ],
  },
];

const TEXTO = [
  { nome: 'Número grande', cls: 'font-display text-6xl font-light tracking-tight', ex: '162,0' },
  { nome: 'Título de página', cls: 'font-display text-5xl font-medium tracking-tight', ex: 'Fila de análise' },
  { nome: 'Título de card', cls: 'font-display text-lg font-semibold', ex: 'Demanda submetida' },
  { nome: 'Corpo', cls: 'text-sm', ex: 'A demanda passa do limite de 75 kW.' },
  { nome: 'Apoio', cls: 'text-xs text-muted', ex: 'Enviado em 22/10/2026' },
];

const MOLAS: [keyof typeof spring, string][] = [
  ['snappy', 'Botão, chip, ícone'],
  ['soft', 'Card, modal, painel'],
  ['layout', 'Reorganização (ref 14)'],
];

function Mola({ nome, uso }: { nome: keyof typeof spring; uso: string }) {
  const [lado, setLado] = useState(false);
  return (
    <div className="rounded-tile bg-surface-2 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <span className="font-mono text-sm font-semibold text-fg">spring.{nome}</span>
        <span className="text-xs text-muted">{uso}</span>
      </div>
      <div className={`flex h-10 rounded-full bg-surface-3 p-1 ${lado ? 'justify-end' : 'justify-start'}`}>
        <motion.span layout className="h-8 w-8 rounded-full bg-primary" transition={spring[nome]} />
      </div>
      <Button size="sm" variant="ghost" className="mt-2" onClick={() => setLado((l) => !l)}>
        Tocar
      </Button>
    </div>
  );
}

export function Tokens() {
  return (
    <div className="space-y-5">
      <Card>
        <h3 className="mb-5 font-display text-xl font-semibold text-fg">Cores por papel</h3>
        <div className="space-y-6">
          {CORES.map((g) => (
            <div key={g.grupo}>
              <p className="mb-3 text-sm font-semibold text-fg-2">{g.grupo}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {g.itens.map(([t, uso]) => (
                  <div key={t} className="overflow-hidden rounded-tile ring-1 ring-inset ring-line">
                    <div className="h-16" style={{ background: `rgb(var(--${t}))` }} />
                    <div className="bg-surface px-3 py-2.5">
                      <p className="font-mono text-xs font-semibold text-fg">{t}</p>
                      <p className="text-xs text-muted">{uso}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted">Troque o tema no topo: as amostras mudam junto. As cores dos gráficos passaram no validador de daltonismo nos dois temas.</p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="mb-5 font-display text-xl font-semibold text-fg">Texto</h3>
          <p className="mb-4 text-sm text-muted">Urbanist nos títulos e números, Manrope no texto.</p>
          <div className="space-y-4">
            {TEXTO.map((t) => (
              <div key={t.nome} className="border-b border-line pb-4 last:border-0 last:pb-0">
                <p className="mb-1 text-xs text-muted">{t.nome}</p>
                <p className={`truncate text-fg ${t.cls}`}>{t.ex}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-5 font-display text-xl font-semibold text-fg">Forma</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['rounded-full', 'Pílula: botão, filtro, badge'],
              ['rounded-control', '14px: campo'],
              ['rounded-tile', '20px: linha, tile'],
              ['rounded-card', '28px: card, modal'],
            ].map(([r, l]) => (
              <div key={r} className="flex items-center gap-3">
                <span className={`h-14 w-14 shrink-0 bg-accent-soft ring-1 ring-inset ring-accent/30 ${r}`} />
                <span className="text-xs text-fg-2">{l}</span>
              </div>
            ))}
          </div>
          <h3 className="mb-4 mt-8 font-display text-xl font-semibold text-fg">Movimento</h3>
          <div className="space-y-3">
            {MOLAS.map(([n, u]) => (
              <Mola key={n} nome={n} uso={u} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
